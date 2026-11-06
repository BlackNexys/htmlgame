type Cue = 'fire' | 'hit' | 'terrainHit' | 'block' | 'ectoplasm';
interface Voice { sources: AudioScheduledSourceNode[]; nodes: AudioNode[]; }

/** Short cosmetic voices with separate limits so firing cannot mask hit/reward cues. */
export class FlickerSound {
    private variation = 0;
    private readonly buffers: AudioBuffer[] = [];
    private readonly voices = new Map<Cue, Voice[]>();
    constructor(private readonly audio: BaseAudioContext) {}

    play(cue: Cue) {
        const group = this.voices.get(cue) ?? [];
        this.voices.set(cue, group);
        const limit = cue === 'fire' ? 2 : cue === 'ectoplasm' ? 1 : 3;
        while (group.length >= limit) this.stop(group.shift()!);
        const voice: Voice = {sources: [], nodes: []}; group.push(voice);
        const variant = this.variation++ % 5;
        const pitch = [1, .975, 1.025, .99, 1.01][variant];
        if (cue === 'fire') {
            this.noise(voice, variant, 6500, 6500, .021, .027, 'highpass'); // dry snap
            this.noise(voice, variant, 3200 * pitch, 2350 * pitch, .095, .019, 'bandpass');
            this.tone(voice, 1260 * pitch, 1130 * pitch, .14, .006, 'sine');
        } else if (cue === 'hit') {
            this.noise(voice, variant, 4000, 1800, .07, .027, 'bandpass');
            this.tone(voice, 850, 580, .055, .014, 'triangle');
        } else if (cue === 'terrainHit') {
            this.noise(voice, variant, 2600, 1900, .055, .011, 'bandpass');
        } else if (cue === 'block') {
            this.tone(voice, 3200, 2850, .035, .018, 'triangle');
            this.noise(voice, variant, 4300, 2300, .08, .013, 'bandpass');
        } else {
            this.tone(voice, 620, 990, .13, .016, 'sine');
            this.tone(voice, 930, 1485, .16, .008, 'sine');
        }
        let remaining = voice.sources.length;
        for (const source of voice.sources) source.onended = () => {
            if (--remaining) return;
            voice.nodes.forEach(node => node.disconnect());
            const index = group.indexOf(voice); if (index >= 0) group.splice(index, 1);
        };
        // No timers or awaits can block combat.
    }
    dispose() {
        for (const group of this.voices.values()) group.forEach(voice => this.stop(voice));
        this.voices.clear(); this.buffers.length = 0;
    }
    private stop(voice: Voice) {
        voice.sources.forEach(source => { try { source.stop(); } catch { /* Already ended. */ } });
        voice.nodes.forEach(node => node.disconnect());
    }
    private envelope(voice: Voice, duration: number, level: number) {
        const gain = this.audio.createGain(), now = this.audio.currentTime;
        gain.gain.setValueAtTime(.0001, now);
        gain.gain.linearRampToValueAtTime(level, now + .003);
        gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
        gain.connect(this.audio.destination); voice.nodes.push(gain); return gain;
    }
    private tone(voice: Voice, from: number, to: number, duration: number, level: number, type: OscillatorType) {
        const source = this.audio.createOscillator(), now = this.audio.currentTime;
        source.type = type; source.frequency.setValueAtTime(from, now);
        source.frequency.exponentialRampToValueAtTime(to, now + duration);
        source.connect(this.envelope(voice, duration, level)); source.start(now); source.stop(now + duration);
        voice.sources.push(source); voice.nodes.push(source);
    }
    private noise(voice: Voice, variant: number, from: number, to: number, duration: number, level: number, type: BiquadFilterType) {
        const audio = this.audio, now = audio.currentTime;
        if (!this.buffers[variant]) {
            const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * .15), audio.sampleRate);
            const samples = buffer.getChannelData(0); let seed = 149 + variant * 701;
            for (let i = 0; i < samples.length; i++) {
                seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; samples[i] = seed / 2147483648 - 1;
            }
            this.buffers[variant] = buffer;
        }
        const source = audio.createBufferSource(), filter = audio.createBiquadFilter();
        source.buffer = this.buffers[variant]; filter.type = type; filter.Q.value = .8;
        filter.frequency.setValueAtTime(from, now); filter.frequency.exponentialRampToValueAtTime(to, now + duration);
        source.connect(filter); filter.connect(this.envelope(voice, duration, level)); source.start(now); source.stop(now + duration);
        voice.sources.push(source); voice.nodes.push(source, filter);
    }
}
