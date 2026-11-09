import type { Interactable } from '../components/Interactable';
import { objectArt } from './ConfluenceScene';
import { ConfluenceSprites } from './ConfluenceSprites';

export class ConfluenceObjectsRenderer {
    constructor(private readonly ctx:CanvasRenderingContext2D,private readonly sprites:ConfluenceSprites,private readonly anchored=false){}
    draw(object:Interactable):boolean {
        const art=objectArt[object.id];if(!art)return false;
        if(object.collected)return true;
        const gate=art.sprite==='shutterClosed',sprite=gate&&object.operated?'shutterOpen':art.sprite;
        const bottom=this.anchored?Math.ceil((object.y+object.height)/48)*48:art.bottom;
        const rect=this.sprites.draw(sprite,object.x+object.width/2,bottom,gate?object.width:art.width,gate?object.height:art.height,gate);
        if(object.active){
            const c=this.ctx;c.save();c.font='9px monospace';c.textAlign='center';c.fillStyle='#d1e0db';c.shadowColor='#050b10';c.shadowBlur=3;c.fillText(object.displayName,object.x+object.width/2,rect.y-10);c.restore();
        }
        return true;
    }
}
