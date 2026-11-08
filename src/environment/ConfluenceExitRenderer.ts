import type { Exit } from '../components/Exit';
import { ConfluenceSprites } from './ConfluenceSprites';

export class ConfluenceExitRenderer {
    constructor(private readonly ctx:CanvasRenderingContext2D,private readonly sprites:ConfluenceSprites){}
    draw(exit:Exit){
        const c=this.ctx;c.save();
        this.sprites.draw('shutterOpen',exit.x+exit.width/2,exit.y2,exit.width,exit.height,true);
        c.font='11px monospace';c.textAlign='center';c.fillStyle=exit.enabled?'#b9f5fa':'#929fa7';c.fillText(exit.enabled?'ONWARD →':exit.lockedLabel,exit.x+exit.width/2,exit.y-16);c.restore();
    }
}
