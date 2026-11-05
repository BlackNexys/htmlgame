import type { Camera } from '../components/Camera';
import { tuning as T } from '../game/config';

export class BackgroundRenderer {
    constructor(private readonly ctx: CanvasRenderingContext2D) {}

    draw(camera: Camera, elapsed: number) {
        const c = this.ctx;
        c.clearRect(0, 0, T.viewportWidth, T.viewportHeight);
        const sky = c.createLinearGradient(0, 0, 0, T.viewportHeight);
        sky.addColorStop(0, '#0b1620'); sky.addColorStop(1, '#1e393e');
        c.fillStyle = sky; c.fillRect(0, 0, T.viewportWidth, T.viewportHeight);
        for (let i = -1; i < 14; i++) {
            const x = i * 140 - camera.x * .18 % 140;
            c.fillStyle = '#12262e'; c.fillRect(x, 120 + (i % 3) * 24, 95, 400);
            c.fillStyle = '#1c343b'; c.fillRect(x + 12, 90 + (i % 3) * 24, 12, 440);
            c.fillStyle = '#29464a'; c.fillRect(x + 34, 230, 18, 50);
        }
        for (let i = 0; i < 35; i++) {
            const x = ((i * 137.3 - camera.x * .3) % 1000 + 1000) % 1000;
            const y = 70 + (i * 53 % 380) + Math.sin(elapsed + i) * 8;
            c.fillStyle = i % 3 ? '#446864' : '#8cb3a0'; c.globalAlpha = .45; c.fillRect(x, y, 2, 2);
        }
        c.globalAlpha = 1;
    }
}
