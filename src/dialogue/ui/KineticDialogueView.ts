import type { BlButton } from '@blacklight/signal-soul/atoms';
import type { CutsceneDirector } from '../CutsceneDirector';
import type { DialogueController } from '../DialogueController';
import type { DialogueScene, Expression } from '../DialogueScene';
import type { DialogueActions, DialoguePresentation } from './DialoguePresentation';
import './kinetic-dialogue.css';

/** A paused exchange staged around one large speaker, with directional turn handoffs. */
export class KineticDialogueView implements DialoguePresentation {
    readonly root = document.createElement('dialog');
    private readonly events = new AbortController();
    private readonly reduced = matchMedia('(prefers-reduced-motion: reduce)');
    private readonly ready = new Map<string, boolean>();
    private readonly next: BlButton;
    private previous?: DialogueController;
    private visible = -1;
    private animations: Animation[] = [];
    private disposed = false;
    constructor(private readonly scene: DialogueScene, actions: DialogueActions, speed: number) {
        this.root.className = 'kinetic-dialogue'; this.root.setAttribute('aria-label', scene.title);
        this.root.innerHTML = `
          <div class="kinetic-shell">
            <header class="kinetic-heading"><div><p class="eyebrow">UNDERWORLD / EXCHANGE</p><h2></h2></div><bl-badge tone="accent"></bl-badge></header>
            <div class="kinetic-stage">
              <p class="kinetic-echo" aria-hidden="true"></p>
              <div class="kinetic-portrait" aria-hidden="true"><span></span><div></div></div>
              <section class="kinetic-copy" aria-label="Conversation">
                <div class="kinetic-speaker"><span class="kinetic-name"></span><span class="kinetic-delivery"></span></div>
                <p class="kinetic-line" aria-hidden="true"></p>
                <p class="sr-only kinetic-announcement" aria-live="polite" aria-atomic="true"></p>
                <p class="kinetic-status"></p>
              </section>
            </div>
            <section class="kinetic-log" aria-label="Conversation log" hidden></section>
            <footer class="kinetic-controls"><div class="kinetic-tools">
              <bl-button data-action="pause" variant="quiet" size="sm">Hold</bl-button>
              <bl-button data-action="history" variant="quiet" size="sm">Log · L</bl-button>
              <bl-button data-action="skip" variant="quiet" size="sm">Skip exchange</bl-button>
              <details><summary>Options</summary><div class="kinetic-options"><label>Text speed <select aria-label="Text speed"><option value="22">Thoughtful</option><option value="36">Normal</option><option value="60">Quick</option><option value="0">Instant</option></select></label><bl-button data-action="autoplay" variant="quiet" size="sm">Autoplay</bl-button></div></details>
            </div><div class="kinetic-advance"><span>ENTER / SPACE</span><bl-button data-action="advance" variant="quiet">Next beat →</bl-button></div></footer>
          </div>`;
        this.root.querySelector('h2')!.textContent = scene.title;
        const badge = this.root.querySelector('bl-badge')!; badge.textContent = scene.label ?? ''; badge.hidden = !scene.label;
        this.next = this.root.querySelector<BlButton>('[data-action="advance"]')!;
        const options = {signal: this.events.signal};
        for (const [key, action] of Object.entries(actions)) {
            if (key !== 'speed') this.root.querySelector(`[data-action="${key}"]`)?.addEventListener('click', () => (action as () => void)(), options);
        }
        const select = this.root.querySelector('select')!; select.value = String(speed);
        select.addEventListener('change', () => actions.speed(Number(select.value)), options);
        this.root.addEventListener('cancel', event => { event.preventDefault(); actions.pause(); }, options);
        this.root.addEventListener('keydown', event => {
            if (event.target instanceof HTMLSelectElement) return;
            if (event.repeat && ['Space', 'Enter', 'Escape', 'KeyL'].includes(event.code)) { event.preventDefault(); return; }
            if (event.code === 'KeyL') { event.preventDefault(); actions.history(); }
            const interactive = event.composedPath().some(node => node instanceof HTMLElement && ['BUTTON', 'SELECT', 'BL-BUTTON', 'SUMMARY'].includes(node.tagName));
            if (!interactive && ['Enter', 'Space'].includes(event.code)) { event.preventDefault(); actions.advance(); }
        }, options);
        for (const speaker of Object.values(scene.speakers)) {
            if (this.ready.has(speaker.portrait.image)) continue;
            this.ready.set(speaker.portrait.image, false);
            const image = new Image(); image.onload = () => { if (!this.disposed) this.ready.set(speaker.portrait.image, true); }; image.src = speaker.portrait.image;
        }
        this.reduced.addEventListener('change', () => { if (this.reduced.matches) this.stopMotion(); }, options);
        document.body.append(this.root);
    }
    open() { this.root.showModal(); void this.next.updateComplete.then(() => { if (!this.disposed) this.next.focus({preventScroll: true}); }); }
    render(director: CutsceneDirector, paused: boolean, log: boolean) {
        const line = director.line, changed = line !== this.previous;
        this.root.dataset.paused = String(paused || log); this.root.dataset.log = String(log);
        this.root.querySelector('[data-action="pause"]')!.textContent = paused ? 'Resume' : 'Hold';
        this.root.querySelector('[data-action="pause"]')!.setAttribute('aria-pressed', String(paused));
        this.root.querySelector('[data-action="history"]')!.setAttribute('aria-expanded', String(log));
        this.root.querySelector('[data-action="autoplay"]')!.setAttribute('aria-pressed', String(director.autoAdvance));
        this.next.textContent = log ? 'Close log' : paused ? 'Resume exchange' : line?.complete ? 'Next beat →' : 'Reveal line';
        this.next.disabled = !line && !paused && !log;
        this.root.querySelector('.kinetic-status')!.textContent = log ? 'CONVERSATION HELD' : paused ? 'EXCHANGE HELD' : director.autoAdvance ? 'AUTOPLAY · HOLD TO TAKE YOUR TIME' : 'MANUAL · ADVANCE WHEN READY';
        if (line) {
            const speaker = this.scene.speakers[line.line.speaker];
            const portrait = this.root.querySelector<HTMLElement>('.kinetic-portrait')!;
            portrait.dataset.ready = String(this.ready.get(speaker.portrait.image));
            if (changed) {
                const previous = this.previous;
                this.root.querySelector('.kinetic-echo')!.textContent = previous ? `${this.scene.speakers[previous.line.speaker].name} / ${previous.line.beats.map(b => b.text).join('')}` : '';
                this.root.dataset.side = speaker.side; this.root.dataset.delivery = line.line.delivery ?? 'normal';
                this.root.style.setProperty('--speaker-accent', speaker.accent);
                this.root.querySelector('.kinetic-name')!.textContent = speaker.name;
                this.root.querySelector('.kinetic-delivery')!.textContent = line.line.delivery === 'soft' ? 'quietly' : line.line.delivery === 'urgent' ? 'insistent' : '';
                this.root.querySelector('.kinetic-announcement')!.textContent = `${speaker.name}: ${line.line.beats.map(b => b.text).join('')}`;
                portrait.querySelector('span')!.textContent = speaker.name[0];
                const drawing = portrait.querySelector('div')!;
                const col = (['neutral', 'amused', 'worried', 'fierce'] as Expression[]).indexOf(line.line.expression);
                drawing.style.backgroundImage = `url("${speaker.portrait.image}")`;
                drawing.style.backgroundPosition = `${col / 3 * 100}% ${speaker.portrait.row * 100}%`;
                portrait.dataset.expression = line.line.expression;
                this.animateTurn(speaker.side, line.line.delivery === 'urgent');
            }
            if (changed || line.visible !== this.visible) {
                const body = this.root.querySelector('.kinetic-line')!; body.replaceChildren();
                line.line.beats.forEach((beat, index) => {
                    const span = document.createElement('span'); span.className = beat.emphasis ?? '';
                    span.textContent = line.units.slice(0, line.visible).filter(unit => unit.beat === index).map(unit => unit.text).join(''); body.append(span);
                });
                this.visible = line.visible;
            }
        }
        const history = this.root.querySelector<HTMLElement>('.kinetic-log')!;
        if (log && (history.hidden || changed)) {
            history.replaceChildren(); const entries = [...director.history];
            if (line) entries.push({speaker: this.scene.speakers[line.line.speaker].name, text: line.text || '…'});
            for (const entry of entries) { const p = document.createElement('p'); const name = document.createElement('strong'); name.textContent = `${entry.speaker} · `; p.append(name, document.createTextNode(entry.text)); history.append(p); }
        }
        history.hidden = !log;
        if (paused || log) this.animations.forEach(animation => animation.pause());
        else this.animations.forEach(animation => { if (animation.playState === 'paused') animation.play(); });
        this.previous = line;
    }
    private animateTurn(side: string, urgent: boolean) {
        this.stopMotion(); if (this.reduced.matches) return;
        const direction = side === 'left' ? -1 : 1;
        const portrait = this.root.querySelector<HTMLElement>('.kinetic-portrait')!;
        const copy = this.root.querySelector<HTMLElement>('.kinetic-copy')!;
        this.animations.push(portrait.animate([
            {opacity: 0, transform: `translateX(${direction * 65}px) scale(.94)`},
            {opacity: 1, transform: 'translateX(0) scale(1)'},
        ], {duration: urgent ? 220 : 340, easing: 'cubic-bezier(.16,1,.3,1)'}));
        this.animations.push(copy.animate([
            {opacity: 0, transform: `translateX(${-direction * 28}px)`},
            {opacity: 1, transform: 'translateX(0)'},
        ], {duration: urgent ? 180 : 280, easing: 'cubic-bezier(.16,1,.3,1)'}));
    }
    private stopMotion() { this.animations.forEach(animation => animation.cancel()); this.animations = []; }
    dispose() { this.disposed = true; this.events.abort(); this.stopMotion(); this.root.close(); this.root.remove(); }
}
