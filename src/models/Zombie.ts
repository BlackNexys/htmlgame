import {Actor, IActor} from './Actor';

interface IZombie extends IActor {
    exp: number;
}

export class Zombie extends Actor {
    hp: number = 25;
    maxDamage: number = 15;
    exp: number;

    constructor({name, exp}: IZombie) {
        super({name});
        this.exp = exp;
    }
}