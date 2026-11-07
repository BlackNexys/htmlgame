import { Particle } from '../../components/Particle';
import type { FlickerEvent, FlickerEffect } from '../../interfaces/Weapon';
import { flickerVisuals } from '../animation/FlickerVisuals';

export class ParticleSystem {
    particles: Particle[] = [];
    flicker: FlickerEffect[] = [];

    consume(events: readonly FlickerEvent[]) {
        for (const event of events) this.flicker.push({...event, age: 0});
    }

    burst(x: number, y: number, color: string, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = i * Math.PI * 2 / count;
            this.particles.push(new Particle({x, y, vx: Math.cos(angle) * 100,
                vy: Math.sin(angle) * 100 - 40, life: .35, color}));
        }
    }

    update(dt: number) {
        this.particles = this.particles.filter(particle => particle.update(dt));
        this.flicker = this.flicker.filter(effect => {
            effect.age += dt; return effect.age < flickerVisuals.effects[effect.kind].duration;
        });
    }
}
