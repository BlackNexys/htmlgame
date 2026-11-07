import type { BlButton } from '@blacklight/signal-soul/atoms';
import type { CutsceneDirector } from '../CutsceneDirector';
import type { DialogueController } from '../DialogueController';
import type { DialogueScene, DialogueCue, Expression } from '../DialogueScene';
import './dialogue.css';
import type { DialogueActions, DialoguePresentation } from './DialoguePresentation';

/** DOM presentation only; the native dialog traps focus, Blacklight supplies controls. */
export class DialogueView implements DialoguePresentation {
    readonly root = document.createElement('dialog');
    private readonly events = new AbortController();
    private readonly portraits = new Map<string, HTMLElement>();
    private previousLine?: DialogueController;
    private previousCount = -1;
    private readonly body: HTMLElement;
    private readonly announcement: HTMLElement;
    private readonly next: BlButton;
    private readonly history: HTMLElement;
    private readonly pause: BlButton;
    private disposed = false;
    private previousCue?: DialogueCue;

    constructor(readonly scene: DialogueScene, actions: DialogueActions, speed: number) {
        this.root.className = 'dialogue-overlay';
        this.root.setAttribute('aria-label', scene.title);
        this.root.innerHTML = `
          <div class="dialogue-shell">
            <header class="dialogue-heading"><div><p class="eyebrow">UNDERWORLD / DIALOGUE</p><h2></h2><p class="dialogue-description"></p></div><bl-badge tone="accent"></bl-badge></header>
            <p class="dialogue-cue" aria-live="off"></p>
            <div class="dialogue-cast" aria-hidden="true"></div>
            <section class="dialogue-panel" aria-label="Conversation">
              <header class="dialogue-speaker"><div><span class="dialogue-name"></span><span class="dialogue-role"></span></div><span class="dialogue-expression"></span></header>
              <div class="dialogue-body" aria-hidden="true"></div>
              <p class="sr-only dialogue-announcement" aria-live="polite" aria-atomic="true"></p>
              <div class="dialogue-history" aria-label="Conversation log" hidden></div>
              <footer class="dialogue-controls">
                <div class="dialogue-tools"><bl-button data-action="history" variant="quiet" size="sm">Log</bl-button><bl-button data-action="pause" variant="quiet" size="sm">Pause</bl-button><bl-button data-action="skip" variant="quiet" size="sm">Skip scene</bl-button>
                <label>Text speed <select aria-label="Text speed"><option value="22">Thoughtful</option><option value="36">Normal</option><option value="60">Quick</option><option value="0">Instant</option></select></label></div>
                <bl-button data-action="advance" variant="primary">Reveal line</bl-button>
              </footer>
              <div class="dialogue-help"><span>ENTER / SPACE · CONTINUE</span><span>ESC · PAUSE &nbsp; L · LOG</span><span class="dialogue-progress"></span></div>
            </section>
          </div>`;
        this.root.querySelector('h2')!.textContent = scene.title;
        const badge = this.root.querySelector('bl-badge')!; badge.textContent = scene.label ?? ''; badge.hidden = !scene.label;
        this.root.querySelector('.dialogue-description')!.textContent = scene.description;
        this.body = this.root.querySelector('.dialogue-body')!;
        this.announcement = this.root.querySelector('.dialogue-announcement')!;
        this.next = this.root.querySelector<BlButton>('[data-action="advance"]')!;
        this.history = this.root.querySelector('.dialogue-history')!;
        this.pause = this.root.querySelector<BlButton>('[data-action="pause"]')!;
        const selector = this.root.querySelector('select')!;
        selector.value = String(speed);
        const options = {signal: this.events.signal};
        selector.addEventListener('change', () => actions.speed(Number(selector.value)), options);
        for (const [key, action] of Object.entries(actions)) {
            if (key === 'speed') continue;
            this.root.querySelector(`[data-action="${key}"]`)?.addEventListener('click', () => (action as () => void)(), options);
        }
        this.root.addEventListener('cancel', event => { event.preventDefault(); actions.pause(); }, options);
        this.root.addEventListener('keydown', event => {
            if (event.repeat && ['Space', 'Enter', 'Escape', 'KeyL'].includes(event.code)) { event.preventDefault(); return; }
            if (event.target instanceof HTMLSelectElement) return;
            if (event.code === 'KeyL') { event.preventDefault(); actions.history(); }
            const interactive = event.composedPath().some(node => node instanceof HTMLElement && ['BUTTON', 'SELECT', 'BL-BUTTON'].includes(node.tagName));
            if (!interactive && ['Enter', 'Space'].includes(event.code)) { event.preventDefault(); actions.advance(); }
        }, options);
        for (const [id, speaker] of Object.entries(scene.speakers)) {
            const portrait = document.createElement('div');
            portrait.className = 'dialogue-portrait'; portrait.dataset.side = speaker.side;
            portrait.hidden = [...this.portraits.values()].some(other => other.dataset.side === speaker.side);
            portrait.style.setProperty('--actor-accent', speaker.accent);
            const drawing = document.createElement('div'); drawing.className = 'portrait-drawing';
            drawing.style.backgroundImage = `url("${speaker.portrait.image}")`;
            drawing.style.backgroundPosition = `0% ${speaker.portrait.row * 100}%`;
            const fallback = document.createElement('span'); fallback.className = 'portrait-fallback'; fallback.textContent = speaker.name[0];
            portrait.append(fallback, drawing);
            // Failed artwork leaves a labelled silhouette; dialogue remains fully usable.
            const image = new Image(); image.onload = () => { if (!this.disposed) portrait.dataset.art = 'ready'; };
            image.src = speaker.portrait.image;
            this.root.querySelector('.dialogue-cast')!.append(portrait); this.portraits.set(id, portrait);
        }
        document.body.append(this.root);
    }
    open() { this.root.showModal(); void this.next.updateComplete.then(() => { if (!this.disposed) this.next.focus({preventScroll: true}); }); }
    render(director: CutsceneDirector, paused: boolean, log: boolean) {
        const line = director.line, changed = line !== this.previousLine;
        this.root.dataset.paused = String(paused || log);
        this.root.dataset.focus = director.cue.focus;
        if (director.cue !== this.previousCue) {
            this.previousCue = director.cue;
            this.root.dispatchEvent(new CustomEvent('dialoguecue', {bubbles: true, detail: {...director.cue}}));
        }
        this.root.querySelector('.dialogue-cue')!.textContent = director.cue.caption;
        this.pause.textContent = paused ? 'Resume' : 'Pause';
        this.pause.setAttribute('aria-pressed', String(paused));
        this.next.textContent = log ? 'Close log' : paused ? 'Resume scene' : !line ? 'Please wait…' : line.complete ? 'Continue' : 'Reveal line';
        this.next.disabled = !line && !paused && !log;
        this.root.querySelector('[data-action="history"]')!.setAttribute('aria-expanded', String(log));
        if (changed && line) {
            const speaker = this.scene.speakers[line.line.speaker];
            this.root.style.setProperty('--speaker-accent', speaker.accent);
            this.root.dataset.delivery = line.line.delivery ?? 'normal';
            this.root.querySelector('.dialogue-name')!.textContent = speaker.name;
            this.root.querySelector('.dialogue-role')!.textContent = speaker.role;
            this.root.querySelector('.dialogue-expression')!.textContent = line.line.delivery ?? 'normal';
            this.announcement.textContent = `${speaker.name}: ${line.line.beats.map(beat => beat.text).join('')}`;
            for (const [id, portrait] of this.portraits) {
                const active = id === line.line.speaker;
                portrait.dataset.active = String(active);
                if (portrait.dataset.side === speaker.side) portrait.hidden = !active;
                if (active) {
                    const column = (['neutral', 'amused', 'worried', 'fierce'] as Expression[]).indexOf(line.line.expression);
                    portrait.dataset.expression = line.line.expression;
                    (portrait.querySelector('.portrait-drawing') as HTMLElement).style.backgroundPositionX = `${column / 3 * 100}%`;
                }
            }
            this.previousCount = -1;
        }
        if (line && (changed || line.visible !== this.previousCount)) {
            this.body.replaceChildren();
            for (let beat = 0; beat < line.line.beats.length; beat++) {
                const span = document.createElement('span'); span.className = line.line.beats[beat].emphasis ?? '';
                span.textContent = line.units.slice(0, line.visible).filter(unit => unit.beat === beat).map(unit => unit.text).join('');
                this.body.append(span);
            }
            this.previousCount = line.visible;
        }
        this.root.dataset.revealing = String(!!line && !line.complete);
        if (log && (this.history.hidden || changed)) {
            this.history.replaceChildren();
            const entries = [...director.history];
            if (line) entries.push({speaker: this.scene.speakers[line.line.speaker].name, text: line.text || '…'});
            for (const entry of entries) { const p = document.createElement('p'); const name = document.createElement('strong'); name.textContent = `${entry.speaker} · `; p.append(name, document.createTextNode(entry.text)); this.history.append(p); }
        }
        this.history.hidden = !log;
        const current = director.history.length + (line ? 1 : 0);
        this.root.querySelector('.dialogue-progress')!.textContent = `${current} / ${this.scene.commands.filter(c => c.kind === 'line').length}`;
        this.previousLine = line;
    }
    dispose() { this.disposed = true; this.events.abort(); this.root.close(); this.root.remove(); }
}
