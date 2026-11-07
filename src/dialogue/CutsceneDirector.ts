import { DialogueController } from './DialogueController';
import { parseDialogueScene, type DialogueScene, type DialogueCue } from './DialogueScene';

export type SceneResult = 'completed' | 'skipped' | 'cancelled';
export interface DialogueHistoryEntry { speaker: string; text: string; }

/** Owns sequence and completion. No DOM, game objects, camera or reward implementation. */
export class CutsceneDirector {
    readonly scene: DialogueScene;
    line?: DialogueController;
    cue: DialogueCue = {kind: 'cue', focus: 'wide', caption: ''};
    history: DialogueHistoryEntry[] = [];
    result?: SceneResult;
    speed = 36;
    autoAdvance: boolean;
    private readTime = 0;
    private index = -1;
    private wait = 0;
    private archived = false;
    constructor(scene: DialogueScene, private readonly effect: (id: string) => void,
        private readonly end: (result: SceneResult) => void, private readonly applied = new Set<string>()) {
        this.scene = parseDialogueScene(scene);
        this.autoAdvance = this.scene.pacing === 'auto' || this.scene.pacing === undefined && this.scene.presentation === 'overlay';
        this.next();
    }
    update(dt: number) {
        if (this.result || !Number.isFinite(dt) || dt < 0) return;
        if (this.line) {
            const wasComplete = this.line.complete;
            this.line.update(dt, this.speed);
            if (this.autoAdvance && wasComplete) {
                this.readTime += dt;
                const words = this.line.line.beats.map(beat => beat.text).join('').trim().split(/\s+/).length;
                const hold = this.line.line.holdSeconds ?? Math.max(2.2, Math.min(7, words * .28));
                if (this.readTime >= hold) this.next();
            }
        }
        else { this.wait -= dt; if (this.wait <= 0) this.next(); }
    }
    advance() {
        if (this.result || !this.line) return;
        if (!this.line.complete) this.line.reveal();
        else this.next();
    }
    skip() { this.finish('skipped'); }
    cancel() { this.finish('cancelled'); }
    private archive() {
        if (!this.line || this.archived) return;
        this.history.push({speaker: this.scene.speakers[this.line.line.speaker].name,
            text: this.line.line.beats.map(beat => beat.text).join('')});
        this.archived = true;
    }
    private next() {
        this.archive(); this.line = undefined; this.archived = false; this.readTime = 0;
        while (++this.index < this.scene.commands.length) {
            const command = this.scene.commands[this.index];
            if (command.kind === 'line') { this.line = new DialogueController(command); return; }
            if (command.kind === 'cue') this.cue = command;
            else { this.wait = command.seconds; if (this.wait > 0) return; }
        }
        this.finish('completed');
    }
    private finish(result: SceneResult) {
        if (this.result) return;
        this.result = result;
        if (result !== 'cancelled') {
            this.archive();
            for (const id of this.scene.completionEffects) {
                const key = `${this.scene.id}:${id}`;
                if (!this.applied.has(key)) { this.applied.add(key); this.effect(id); }
            }
        }
        this.end(result);
    }
}
