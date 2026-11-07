import type { DialogueLine } from './DialogueScene';

/** Browser-free text playback. Authored pauses and graphemes use elapsed seconds. */
export class DialogueController {
    readonly units: { text: string; beat: number; delay: number }[];
    visible = 0;
    private remaining = 0;
    constructor(readonly line: DialogueLine) {
        const segmenter = new Intl.Segmenter(undefined, {granularity: 'grapheme'});
        this.units = line.beats.flatMap((beat, index) => {
            const parts = [...segmenter.segment(beat.text)].map(part => part.segment);
            return parts.map((text, i) => ({text, beat: index, delay: i === parts.length - 1 ? beat.pauseAfter ?? 0 : 0}));
        });
    }
    get complete() { return this.visible === this.units.length; }
    get text() { return this.units.slice(0, this.visible).map(unit => unit.text).join(''); }
    reveal() { this.visible = this.units.length; this.remaining = 0; }
    update(dt: number, charactersPerSecond: number) {
        if (charactersPerSecond === 0) { this.reveal(); return; }
        if (!Number.isFinite(dt) || dt <= 0 || this.complete) return;
        this.remaining -= dt;
        while (this.remaining <= 0 && !this.complete) {
            const unit = this.units[this.visible++];
            this.remaining += 1 / charactersPerSecond + unit.delay;
        }
    }
}
