import type { DialogueController } from '../DialogueController';
import type { CutsceneDirector } from '../CutsceneDirector';
import type { DialogueScene, Expression } from '../DialogueScene';
import type { DialogueActions, DialoguePresentation } from './DialoguePresentation';
import './action-dialogue.css';

/** A single speaker at the edge of the playfield. Never opens a modal or takes focus. */
export class ActionDialogueView implements DialoguePresentation {
    readonly root = document.createElement('section');
    private readonly events = new AbortController();
    private previousLine?: DialogueController;
    private previousVisible = -1;
    private readonly art = new Map<string, boolean>();
    private disposed = false;
    constructor(private readonly scene: DialogueScene, actions: DialogueActions, speed: number, parent?: HTMLElement) {
        this.root.className = 'action-dialogue'; this.root.setAttribute('aria-label', 'Travelling dialogue');
        this.root.innerHTML = `
          <div class="action-dialogue-main">
            <div class="action-portrait" aria-hidden="true"><span></span><div></div></div>
            <div class="action-dialogue-copy"><header><span class="action-speaker"></span><span class="action-delivery"></span></header>
              <p class="action-line" aria-hidden="true"></p>
              <p class="sr-only action-announcement" aria-live="polite" aria-atomic="true"></p>
              <div class="action-dialogue-tools"><span class="action-dialogue-state"></span>
                <bl-button data-action="advance" variant="quiet" size="sm">Next · N</bl-button>
                <bl-button data-action="history" variant="quiet" size="sm">Log · L</bl-button>
                <details><summary aria-label="Dialogue options">•••</summary><div class="action-dialogue-options">
                  <label>Text speed <select aria-label="Text speed"><option value="22">Thoughtful</option><option value="36">Normal</option><option value="60">Quick</option><option value="0">Instant</option></select></label>
                  <bl-button data-action="autoplay" variant="quiet" size="sm">Autoplay</bl-button>
                  <bl-button data-action="pause" variant="quiet" size="sm">Hold dialogue</bl-button>
                  <bl-button data-action="skip" variant="quiet" size="sm">Skip dialogue</bl-button>
                </div></details>
              </div>
            </div>
          </div><div class="action-log" role="region" aria-label="Conversation log" hidden></div>`;
        for (const [key, action] of Object.entries(actions)) {
            if (key !== 'speed') this.root.querySelector(`[data-action="${key}"]`)?.addEventListener('click', () => (action as () => void)(), {signal: this.events.signal});
        }
        const select = this.root.querySelector('select')!; select.value = String(speed);
        select.addEventListener('change', () => actions.speed(Number(select.value)), {signal: this.events.signal});
        // Pointer actions keep canvas focus; keyboard users may tab in and hold the game.
        this.root.addEventListener('pointerdown', event => { if (!(event.target instanceof HTMLSelectElement)) event.preventDefault(); }, {signal: this.events.signal});
        for (const speaker of Object.values(scene.speakers)) {
            if (this.art.has(speaker.portrait.image)) continue;
            this.art.set(speaker.portrait.image, false);
            const image = new Image(); image.onload = () => { if (!this.disposed) this.art.set(speaker.portrait.image, true); }; image.src = speaker.portrait.image;
        }
        (parent ?? document.body).append(this.root);
        if (!parent) this.root.classList.add('action-dialogue-standalone');
    }
    open() { /* Nonmodal: the host retains keyboard focus. */ }
    render(director: CutsceneDirector, paused: boolean, log: boolean) {
        const line = director.line, changed = line !== this.previousLine;
        this.root.dataset.paused = String(paused || log);
        this.root.querySelector('.action-dialogue-state')!.textContent = log ? 'LOG / HELD' : paused ? 'HELD' : director.autoAdvance ? 'ON THE MOVE' : 'MANUAL';
        const advance = this.root.querySelector('[data-action="advance"]')!;
        advance.textContent = log ? 'Close log · L' : paused ? 'Resume' : 'Next · N';
        advance.setAttribute('aria-label', log ? 'Close conversation log' : paused ? 'Resume dialogue' : 'Next dialogue line');
        this.root.querySelector('[data-action="history"]')!.setAttribute('aria-expanded', String(log));
        this.root.querySelector('[data-action="autoplay"]')!.setAttribute('aria-pressed', String(director.autoAdvance));
        if (line) {
            const speaker = this.scene.speakers[line.line.speaker];
            this.root.style.setProperty('--speaker-accent', speaker.accent);
            this.root.dataset.delivery = line.line.delivery ?? 'normal';
            const portrait = this.root.querySelector<HTMLElement>('.action-portrait')!;
            portrait.dataset.ready = String(this.art.get(speaker.portrait.image));
            if (changed) {
                this.root.querySelector('.action-speaker')!.textContent = speaker.name;
                this.root.querySelector('.action-delivery')!.textContent = line.line.delivery === 'soft' ? 'quietly' : line.line.delivery === 'urgent' ? 'urgently' : '';
                this.root.querySelector('.action-announcement')!.textContent = `${speaker.name}: ${line.line.beats.map(b => b.text).join('')}`;
                portrait.querySelector('span')!.textContent = speaker.name[0];
                const drawing = portrait.querySelector('div')!;
                drawing.style.backgroundImage = `url("${speaker.portrait.image}")`;
                const col = (['neutral', 'amused', 'worried', 'fierce'] as Expression[]).indexOf(line.line.expression);
                drawing.style.backgroundPosition = `${col / 3 * 100}% ${speaker.portrait.row * 100}%`;
                portrait.dataset.expression = line.line.expression;
            }
            if (changed || line.visible !== this.previousVisible) {
                const body = this.root.querySelector('.action-line')!; body.replaceChildren();
                line.line.beats.forEach((beat, index) => {
                    const span = document.createElement('span'); span.className = beat.emphasis ?? '';
                    span.textContent = line.units.slice(0, line.visible).filter(unit => unit.beat === index).map(unit => unit.text).join(''); body.append(span);
                });
                this.previousVisible = line.visible;
            }
        }
        const history = this.root.querySelector<HTMLElement>('.action-log')!;
        if (log && (history.hidden || changed)) {
            history.replaceChildren();
            const entries = [...director.history];
            if (line) entries.push({speaker: this.scene.speakers[line.line.speaker].name, text: line.text || '…'});
            for (const entry of entries) { const p = document.createElement('p'); const name = document.createElement('strong'); name.textContent = `${entry.speaker} · `; p.append(name, document.createTextNode(entry.text)); history.append(p); }
        }
        history.hidden = !log; this.previousLine = line;
    }
    dispose() { this.disposed = true; this.events.abort(); this.root.remove(); }
}
