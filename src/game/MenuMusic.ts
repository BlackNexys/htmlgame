/** One title-screen track; playback failure never blocks game loading or controls. */
export class MenuMusic {
    private active = false;
    private muted = false;
    private focused = true;
    private disposed = false;
    private pending = false;
    private request = 0;
    private readonly events = new AbortController();

    constructor(private readonly audio: HTMLAudioElement,
        private readonly page: Pick<Document, 'hidden' | 'addEventListener'> = document,
        host: EventTarget = window) {
        audio.loop = true; audio.volume = .35;
        const options = {signal: this.events.signal};
        // Retry after user interaction when the browser blocks initial autoplay.
        page.addEventListener('click', this.sync, options);
        page.addEventListener('keyup', this.sync, options);
        page.addEventListener('visibilitychange', this.sync, options);
        host.addEventListener('blur', () => { this.focused = false; this.sync(); }, options);
        host.addEventListener('focus', () => { this.focused = true; this.sync(); }, options);
    }

    update(active: boolean, muted: boolean) {
        if (this.disposed) return;
        this.active = active; this.muted = muted; this.audio.muted = muted;
        this.sync();
    }

    dispose() {
        this.disposed = true; this.events.abort(); this.sync();
        this.audio.removeAttribute('src'); this.audio.load();
    }

    private get shouldPlay() { return !this.disposed && this.active && !this.muted && !this.page.hidden && this.focused; }
    private readonly sync = () => {
        if (!this.shouldPlay) {
            this.request++; this.pending = false; this.audio.pause(); return;
        }
        if (!this.audio.paused || this.pending) return;
        const request = ++this.request; this.pending = true;
        void this.audio.play().catch(() => { /* Autoplay or missing music is optional. Retry on interaction. */ })
            .finally(() => {
                if (request === this.request) this.pending = false;
                if (!this.shouldPlay) this.audio.pause();
            });
    };
}
