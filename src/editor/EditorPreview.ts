import { formatDocument, type LevelDocument } from '../levels/LevelDocument';

/** A separate browsing context consumes a frozen JSON snapshot, never editor state. */
export class EditorPreview {
    private url?: string;
    constructor(private readonly dialog: HTMLDialogElement, private readonly frame: HTMLIFrameElement) {
        dialog.addEventListener('close', () => this.clear());
    }
    open(level: LevelDocument) {
        this.clear();
        this.url = URL.createObjectURL(new Blob([formatDocument(level)], {type: 'application/json'}));
        const game = new URL('./index.html', document.baseURI);
        game.searchParams.set('levelUrl', this.url);
        this.frame.src = game.href;
        this.dialog.showModal();
    }
    private clear() {
        this.frame.src = 'about:blank';
        if (this.url) URL.revokeObjectURL(this.url);
        this.url = undefined;
    }
}
