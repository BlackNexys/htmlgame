import type { Particle } from '../components/Particle';

export class ParticleRenderer {
    constructor(private readonly ctx: CanvasRenderingContext2D) {}
    draw(particles: Particle[]) {
        for (const particle of particles) {
            this.ctx.globalAlpha = Math.min(1, particle.life * 4); this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, particle.width, particle.height);
        }
        this.ctx.globalAlpha = 1;
    }
}
