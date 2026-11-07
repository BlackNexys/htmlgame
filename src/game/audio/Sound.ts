import type { GameEvent } from '../../interfaces/Game';
import { FlickerSound } from './FlickerSound';
export class Sound {
    muted = false;
    private context?: AudioContext;
    private flicker?: FlickerSound;
    unlock() {
        try {
            this.context = this.context || new AudioContext();
            this.flicker = this.flicker || new FlickerSound(this.context);
            void this.context.resume().catch(() => {});
        } catch { /* Audio is optional. */ }
    }
    dispose() {
        this.flicker?.dispose(); this.flicker = undefined;
        if (this.context) void this.context.close().catch(() => {});
        this.context = undefined;
    }
    play(event: GameEvent) {
        if (this.muted || !this.context || this.context.state !== 'running') return;
        try { this.cue(event); } catch { /* Audio failure must never stop simulation. */ }
    }
    private cue(event: GameEvent) {
        if (event === 'fire' || event === 'hit' || event === 'terrainHit' || event === 'block' || event === 'ectoplasm') {
            this.flicker?.play(event); return;
        }
        const audio = this.context!;
        const frequencies = {hurt: 90, defeat: 120, jump: 270, win: 740, enemyFire: 350, charge: 220, revive: 440};
        const tone = audio.createOscillator(); const gain = audio.createGain();
        tone.type = event === 'hurt' ? 'triangle' : 'sine';
        tone.frequency.setValueAtTime(frequencies[event], audio.currentTime);
        tone.frequency.exponentialRampToValueAtTime(frequencies[event] * (event === 'jump' || event === 'win' ? 1.8 : 0.35), audio.currentTime + 0.12);
        gain.gain.setValueAtTime(0.035, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.14);
        tone.connect(gain); gain.connect(audio.destination);
        tone.start(); tone.stop(audio.currentTime + 0.15);
        tone.onended = () => { tone.disconnect(); gain.disconnect(); };
    }
}
