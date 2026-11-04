import { GameEvent } from './World';
export class Sound {
    muted = false;
    private context?: AudioContext;
    unlock() {
        try {
            this.context = this.context || new AudioContext();
            void this.context.resume().catch(() => {});
        } catch { /* Audio is optional. */ }
    }
    play(event: GameEvent) {
        if (this.muted || !this.context || this.context.state !== 'running') return;
        const audio = this.context;
        const frequencies: Record<GameEvent, number> = {fire: 540, hit: 180, hurt: 90, defeat: 120, jump: 270, win: 740,
            enemyFire: 350, charge: 220, block: 850, revive: 440};
        const tone = audio.createOscillator(); const gain = audio.createGain();
        tone.type = event === 'hurt' || event === 'hit' ? 'triangle' : 'sine';
        tone.frequency.setValueAtTime(frequencies[event], audio.currentTime);
        tone.frequency.exponentialRampToValueAtTime(frequencies[event] * (event === 'jump' || event === 'win' ? 1.8 : 0.35), audio.currentTime + 0.12);
        gain.gain.setValueAtTime(0.035, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.14);
        tone.connect(gain); gain.connect(audio.destination);
        tone.start(); tone.stop(audio.currentTime + 0.15);
        tone.onended = () => { tone.disconnect(); gain.disconnect(); };
    }
}
