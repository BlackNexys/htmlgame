export class Map {
    map: any[];
    tileSize: number = 64;

    constructor({ map }: { map: any[] }) {
        this.map = map;
    }

    place(callback: Function) {
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                callback({type: parseInt(this.map[y][x]), x: x * this.tileSize, y: y * this.tileSize });
            }
        }
    }
}