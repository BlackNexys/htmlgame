import { GameElement } from './GameElement';
import type { ParticleProps } from '../interfaces/Particle';

export class Particle extends GameElement {
    vx: number;
    vy: number;
    life: number;
    readonly color: string;

    constructor(props: ParticleProps) {
        super({width: 4, height: 4});
        this.spawn(props);
        this.vx = props.vx; this.vy = props.vy;
        this.life = props.life; this.color = props.color;
    }

    update(dt: number) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += 200 * dt;
        this.life -= dt;
        return this.life > 0;
    }
}
