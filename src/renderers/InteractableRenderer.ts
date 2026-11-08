import type { Interactable } from '../components/Interactable';
import type { ConfluenceObjectsRenderer } from '../environment/ConfluenceObjectsRenderer';
export class InteractableRenderer {
    constructor(private readonly c:CanvasRenderingContext2D,private readonly artwork?:ConfluenceObjectsRenderer){}
    draw(object:Interactable){
        if(this.artwork?.draw(object))return;
        if(!object.active)return;
        const c=this.c,{x,y,width:w,height:h}=object;
        c.save();c.fillStyle=object.definition.kind==='collect'?'#c1a384':'#273d4b';c.fillRect(x,y,w,h);
        c.strokeStyle=object.definition.kind==='operate'?'#63dfeb':'#c9d6cc';c.lineWidth=2;c.strokeRect(x+1,y+1,w-2,h-2);
        if(object.definition.solid){for(let px=x+8;px<x+w;px+=12){c.beginPath();c.moveTo(px,y);c.lineTo(px,y+h);c.stroke();}}
        else{c.fillStyle='#d4e1d9';c.fillRect(x+6,y+8,Math.max(4,w-12),3);c.fillRect(x+6,y+15,Math.max(4,w-18),2);}
        c.font='9px monospace';c.textAlign='center';c.fillStyle='#c5d3d3';c.fillText(object.displayName,x+w/2,y-9);c.restore();
    }
}
