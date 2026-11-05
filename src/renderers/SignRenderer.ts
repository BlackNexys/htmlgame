import type { Sign } from '../components/Sign';

export class SignRenderer {
    constructor(private readonly ctx: CanvasRenderingContext2D) {}
    draw(sign: Sign) {
        const c = this.ctx;
        c.textAlign = 'left'; c.font = 'bold 12px monospace'; c.fillStyle = '#9fae99'; c.fillText(sign.title, sign.x, sign.y);
        c.font = '10px monospace'; c.fillStyle = '#637f78'; c.fillText(sign.text, sign.x, sign.y + 18);
    }
}
