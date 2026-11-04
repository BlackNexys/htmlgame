import { Map } from "./Map";

export class GameScreen {
    canvas: HTMLCanvasElement = document.createElement('canvas');
    context: CanvasRenderingContext2D = this.canvas.getContext('2d');
    map: Map;
    width: number = 720;
    height: number = 480;

    init(lifeCycle: () => void) {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        document.getElementById('game').appendChild(this.canvas);

        setInterval(() => {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            lifeCycle();
        }, 15);
    }
}
