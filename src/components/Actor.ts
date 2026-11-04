import { GameElement } from "./GameElement";

export class Actor extends GameElement {
    y_velocity: number = 0;
    x_velocity: number = 0;
    grounded: boolean = false;
    jumpRequested: boolean = false;
    moving = { up: false, bottom: false, left: false, right: false };

    movement() {
        if (this.jumpRequested && this.grounded) {
            this.y_velocity = -18;
            this.grounded = false;
        }
        this.jumpRequested = false;

        if (this.moving.left) this.x_velocity -= 0.5;
        if (this.moving.right) this.x_velocity += 0.5;
        this.y_velocity += 1.5;
        this.x_velocity *= 0.9;
        this.y_velocity *= 0.9;

        const walls = this.gameArea.map.entities.filter(entity => entity !== this);
        this.x += this.x_velocity;
        for (const wall of walls) {
            if (this.x < wall.x + wall.width && this.x + this.width > wall.x &&
                this.y < wall.y + wall.height && this.y + this.height > wall.y) {
                if (this.x_velocity > 0) this.x = wall.x - this.width;
                else if (this.x_velocity < 0) this.x = wall.x + wall.width;
                this.x_velocity = 0;
            }
        }

        this.y += this.y_velocity;
        this.grounded = false;
        for (const wall of walls) {
            if (this.x < wall.x + wall.width && this.x + this.width > wall.x &&
                this.y < wall.y + wall.height && this.y + this.height > wall.y) {
                if (this.y_velocity > 0) {
                    this.y = wall.y - this.height;
                    this.grounded = true;
                } else if (this.y_velocity < 0) {
                    this.y = wall.y + wall.height;
                }
                this.y_velocity = 0;
            }
        }
        this.x2 = this.x + this.width;
        this.y2 = this.y + this.height;
    }

    render() {
        this.movement();
        this.gameArea.context.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    }
}
