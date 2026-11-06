/** Arrow navigation supplements native Tab/Enter without replacing button semantics. */
export class MenuNavigation {
    private readonly events = new AbortController();
    constructor(private readonly root: HTMLElement) {
        root.addEventListener('keydown', event => this.keyDown(event), {signal: this.events.signal});
    }
    dispose() { this.events.abort(); }
    private keyDown(event: KeyboardEvent) {
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        const items = [...this.root.querySelectorAll<HTMLElement>('[data-menu-item]')]
            .filter(item => !item.hidden && !item.hasAttribute('disabled') && item.getClientRects().length > 0);
        if (!items.length) return;
        event.preventDefault();
        const current = items.indexOf(document.activeElement as HTMLElement);
        const index = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
            : current < 0 ? (event.key === 'ArrowDown' ? 0 : items.length - 1)
            : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items[index].focus({preventScroll: true});
    }
}
