import { Map } from "./Map";
import { Actor } from "./Actor";
import { Coords, Coord, Collisions } from "../interfaces/Coords";

export interface IGameScreen {
    height: number;
    width: number;
}

export class GameScreen {
    canvas : HTMLCanvasElement = document.createElement('canvas');
    context: CanvasRenderingContext2D = this.canvas.getContext('2d');
    map: Map;
    width: number = 720;
    height: number = 480;
    
    
    init(lifeCycle: Function) {
        this.setSize();
        document.getElementById('game').appendChild(this.canvas);

        setInterval(async () => {
            await this.clear();
            await lifeCycle();
        }, 15);
    }

    checkCollisions (target: Actor) {
        const gameEntities = this.map.entities;
        const visualZone = [target.x - 128, target.x2 + 128, target.y - 128, target.y2 + 128];
        target.coords = new Coords({
            TL: new Coord({x: target.x, y: target.y}),
            TR: new Coord({x: target.x2, y: target.y}),
            BL: new Coord({x: target.x, y: target.y2}),
            BR: new Coord({x: target.x2, y: target.y2}),
        });
        const collisions = gameEntities.filter(entry => {
            return target != entry && entry.x > visualZone[0] && entry.x2 < visualZone[1] && entry.y > visualZone[2] && entry.y2 < visualZone[3];
        }).map((entry) => {
            return new Coords({
                TL: new Coord({x: entry.x, y: entry.y}),
                TR: new Coord({x: entry.x2, y: entry.y}),
                BL: new Coord({x: entry.x, y: entry.y2}),
                BR: new Coord({x: entry.x2, y: entry.y2}),
            });
        });
        
        return new Collisions({
            top: collisions.filter((coords: Coords) => {
                return coords.BL.x < target.coords.TR.x && coords.BR.x > target.coords.TL.x && target.coords.TL.y == coords.BL.y;
            }).length > 0,
            bottom: collisions.filter((coords: Coords) => {
                return coords.TL.x < target.coords.BR.x && coords.TR.x > target.coords.BL.x && target.coords.BL.y == coords.TL.y;
            }).length > 0,
            left: collisions.filter((coords: Coords) => {
                return coords.BL.y > target.coords.TR.y && coords.TL.y < target.coords.BR.y && target.coords.BL.x == coords.BR.x;
            }).length > 0,
            right: collisions.filter((coords: Coords) => {
                return coords.BL.y > target.coords.TR.y && coords.TL.y < target.coords.BR.y && target.coords.BR.x == coords.TL.x;
            }).length > 0,
            collisions: collisions
        })
    }

    setSize() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}