import type { Exit } from '../components/Exit';

export class ExitRenderer {
    constructor(private readonly ctx: CanvasRenderingContext2D) {}
    draw(exit: Exit) {
        const c = this.ctx;
        c.shadowColor = '#a5efd2'; c.shadowBlur = 25;
        c.fillStyle = '#547f72'; c.fillRect(exit.x - 8, exit.y - 8, exit.width + 16, exit.height + 8);
        c.shadowBlur = 0; c.fillStyle = '#0e262c'; c.fillRect(exit.x, exit.y, exit.width, exit.height);
        c.fillStyle = '#9cdebd';
        for (let i = 0; i < 4; i++) c.fillRect(exit.x + 10 + i * 13, exit.y + 14, 3, exit.height - 14);
        c.font = '12px monospace'; c.textAlign = 'center'; c.fillText('PASSAGE', exit.x + 32, exit.y - 22);
    }
}
