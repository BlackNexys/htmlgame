export interface IActor {
    name: string;
} 

export class Actor {
    hp: number = 100;
    maxDamage: number = 10;
    name: string;

    constructor({name} : IActor) {
        this.name = name;
    }
    
    getDamage() {
        return Math.floor(Math.random() * this.maxDamage) + 1
    }

    attack(target : Actor) {
        const dmg = this.getDamage();
        console.error(`${target.name} takes ${dmg} points of damage`);

        target.hp = target.hp - dmg;
    }
}