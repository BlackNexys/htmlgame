export interface IGameScreen {
    height: number;
    width: number;
}

export class GameScreen {
    canvas : HTMLCanvasElement = document.createElement('canvas');
    context: CanvasRenderingContext2D = this.canvas.getContext('2d');
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

    setSize() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}