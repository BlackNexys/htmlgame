import { Particle } from '../components/Particle';

export class ParticleSystem {
    particles: Particle[] = [];

    burst(x: number, y: number, color: string, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = i * Math.PI * 2 / count;
            this.particles.push(new Particle({x, y, vx: Math.cos(angle) * 100,
                vy: Math.sin(angle) * 100 - 40, life: .35, color}));
        }
    }

    update(dt: number) { this.particles = this.particles.filter(particle => particle.update(dt)); }
}
