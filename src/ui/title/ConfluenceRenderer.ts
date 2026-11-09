import {artFrame,type Point} from './TitleArt';
import {trainPhase,type ConfluenceArt,type ConfluenceLayer} from './ConfluenceArt';

export interface SceneInspection {hidden?: ReadonlySet<string>; solo?: string; guides?: boolean;}
type Operation=ConfluenceLayer|{kind:'cache';canvas:HTMLCanvasElement};

/** Menu-owned presentation only. No level, World, collisions or campaign state. */
export class ConfluenceRenderer {
    private readonly c:CanvasRenderingContext2D;
    private readonly operations:Operation[]=[];
    readonly estimatedBytes:number;
    constructor(readonly canvas:HTMLCanvasElement,readonly art:ConfluenceArt,private readonly images:ReadonlyMap<string,HTMLImageElement>){
        const c=canvas.getContext('2d');if(!c)throw Error('Decorative canvas unavailable');this.c=c;c.imageSmoothingEnabled=false;
        let cached=0;
        for(let i=0;i<art.layers.length;i++){
            const layer=art.layers[i];
            if(layer.kind!=='image'){this.operations.push(layer);continue;}
            const plate=document.createElement('canvas');plate.width=art.width;plate.height=art.height;const p=plate.getContext('2d');if(!p)throw Error('Title cache unavailable');p.imageSmoothingEnabled=false;
            let next:ConfluenceLayer|undefined=layer;
            while(next?.kind==='image'){
                p.save();this.mask(p,next.mask);const im=images.get(next.image);if(im)p.drawImage(im,next.position.x,next.position.y);p.restore();
                next=art.layers[i+1];if(next?.kind==='image')i++;else break;
            }
            this.operations.push({kind:'cache',canvas:plate});cached+=plate.width*plate.height*4;
        }
        this.estimatedBytes=cached+[...images.values()].reduce((sum,im)=>sum+im.naturalWidth*im.naturalHeight*4,0);
    }

    draw(timeMs:number,_pose='confluence',seed=0,inspection:SceneInspection={}){
        const c=this.c,t=Math.max(0,timeMs);c.clearRect(0,0,this.art.width,this.art.height);
        const inspect=inspection.hidden?.size||inspection.solo;
        for(const layer of inspect?this.art.layers:this.operations){
            if(layer.kind==='cache'){c.drawImage(layer.canvas,0,0);continue;}
            if(inspection.hidden?.has(layer.id)||inspection.solo&&inspection.solo!==layer.id)continue;
            c.save();this.mask(c,layer.mask);this.layer(layer,t,seed);c.restore();
        }
        if(inspection.guides)this.guides(t);
        this.canvas.dataset.actorFrame=String(artFrame(this.art.clips.cole,t));
        this.canvas.dataset.catFrame=this.art.clips.cat?String(artFrame(this.art.clips.cat,t)):'absent';
        this.canvas.dataset.time=String(Math.round(t));
        const train=this.art.layers.find(l=>l.kind==='train');
        this.canvas.dataset.trainActive=String(train?.kind==='train'&&trainPhase(train,t,seed)!==undefined&&this.images.has(this.art.clips[train.clip].image));
        this.canvas.dataset.artMib=(this.estimatedBytes/1048576).toFixed(1);
    }

    private mask(c:CanvasRenderingContext2D,points?:Point[]){
        if(!points)return;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.clip();
    }
    private clip(id:string,time:number,at?:Point,opacity=1){
        const clip=this.art.clips[id],image=this.images.get(clip.image);if(!image)return;
        const frame=clip.frames[artFrame(clip,time)],anchor=frame.anchor??clip.anchor,position=at??clip.position,scale=clip.scale??1,c=this.c;
        c.save();c.globalAlpha*=opacity;c.translate(Math.round(position.x),Math.round(position.y));if(clip.mirror)c.scale(-1,1);
        c.drawImage(image,...frame.rect,Math.round(-anchor.x*scale),Math.round(-anchor.y*scale),frame.rect[2]*scale,frame.rect[3]*scale);c.restore();
    }
    private strength(id:string,time:number){const clip=this.art.clips[id];return clip.frames[artFrame(clip,time)].intensity??.85;}
    private layer(layer:ConfluenceLayer,time:number,seed:number){
        const c=this.c,t=time/1000;
        switch(layer.kind){
            case 'image': {const im=this.images.get(layer.image);if(im)c.drawImage(im,layer.position.x,layer.position.y);break;}
            case 'clip': this.clip(layer.clip,time+(layer.offsetMs??0));break;
            case 'water': {
                const clip=this.art.clips[layer.clip],image=this.images.get(clip.image);if(!image)return;
                const frame=clip.frames[artFrame(clip,time)],[sx,sy,sw,sh]=frame.rect;
                c.globalAlpha=layer.opacity;c.globalCompositeOperation='screen';
                const top=Math.min(...layer.mask!.map(p=>p.y));
                for(let y=top;y<this.art.height;y+=48){
                    const depth=Math.max(0,(y-top)/(this.art.height-top)),w=Math.round(192+depth*144),h=96;
                    const phase=(t*layer.speed*(.45+depth*.55))%(w*2);
                    c.save();c.beginPath();c.rect(0,y,this.art.width,48);c.clip();
                    for(let x=-w-phase,index=0;x<this.art.width;x+=w,index++){
                        c.save();c.translate(Math.round(x)+(index%2?w:0),y-24);if(index%2)c.scale(-1,1);c.drawImage(image,sx,sy,sw,sh,0,0,w,h);c.restore();
                    }
                    c.restore();
                }
                break;
            }
            case 'reflection': c.globalCompositeOperation='screen';this.clip(layer.clip,time,undefined,layer.opacity*this.strength(layer.sourceClip,time));break;
            case 'train': {
                const phase=trainPhase(layer,time,seed);if(phase!==undefined)this.clip(layer.clip,time,{x:layer.from.x+(layer.to.x-layer.from.x)*phase,y:layer.from.y+(layer.to.y-layer.from.y)*phase});break;
            }
            case 'mist': {
                const [x,y,w,h]=layer.region;c.fillStyle='#72b9c9';
                for(let i=0;i<32;i++){
                    const phase=(t/(20+i%7)+i*.618)%1,px=x+(i*83+phase*100)%w,py=y+(i*47)%h-Math.sin(phase*Math.PI)*12;
                    c.globalAlpha=Math.sin(phase*Math.PI)*.035;c.fillRect(Math.round(px),Math.round(py),24+i%5*8,2);
                }
                break;
            }
            case 'shadows': for(const contact of layer.contacts){
                c.save();c.translate(contact.position.x,contact.position.y);c.scale(1,contact.height/contact.width);
                const g=c.createRadialGradient(0,0,0,0,0,contact.width/2);g.addColorStop(0,`rgba(2,5,12,${contact.opacity})`);g.addColorStop(1,'rgba(2,5,12,0)');c.fillStyle=g;c.fillRect(-contact.width/2,-contact.width/2,contact.width,contact.width);c.restore();
            }break;
            case 'lights': {
                const clip=this.art.clips[layer.sourceClip],frame=clip.frames[artFrame(clip,time)],emitter=frame.emitter;
                if(emitter){const root=frame.anchor??clip.anchor,scale=clip.scale??1;this.glow({x:clip.position.x+(emitter.x-root.x)*scale*(clip.mirror?-1:1),y:clip.position.y+(emitter.y-root.y)*scale},65,'#ff3ba3',.06*this.strength(layer.sourceClip,time));}
                for(const light of layer.points)this.glow(light.position,light.radius,light.color,light.opacity*(.94+.06*Math.sin(t*.8)));
                break;
            }
            case 'screen': {
                c.translate(layer.position.x,layer.position.y);c.rotate(layer.angle);c.beginPath();c.rect(-layer.width/2,-layer.height/2,layer.width,layer.height);c.clip();
                c.fillStyle='#5ce1eb';for(let i=0;i<4;i++)c.fillRect(-layer.width*.36,-layer.height*.3+i*5,layer.width*(i%2?.5:.65),2);
                c.globalAlpha=.22;c.fillRect(-layer.width/2,-layer.height/2+(t*3%layer.height),layer.width,2);break;
            }
            case 'sleep': for(let i=0;i<3;i++){
                const phase=(t/4.8+i/3)%1;c.globalAlpha=Math.sin(phase*Math.PI)*.65;c.fillStyle='#e8deed';c.font=`bold ${11+i*2}px monospace`;c.fillText(i?'Z':'z',Math.round(layer.position.x+phase*27),Math.round(layer.position.y-phase*40));
            }break;
        }
    }
    private glow(at:Point,radius:number,color:string,opacity:number){
        const c=this.c;c.save();c.globalAlpha*=opacity;c.globalCompositeOperation='screen';
        const g=c.createRadialGradient(at.x,at.y,0,at.x,at.y,radius);g.addColorStop(0,color);g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(at.x-radius,at.y-radius,radius*2,radius*2);c.restore();
    }
    private guides(time:number){
        const c=this.c;c.save();c.lineWidth=2;c.strokeStyle='#63dfeb';c.fillStyle='#fff0ce';c.font='13px monospace';
        for(const layer of this.art.layers){if(layer.mask){c.beginPath();layer.mask.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.stroke();}}
        for(const [id,clip]of Object.entries(this.art.clips)){
            const frame=clip.frames[artFrame(clip,time)],at=clip.position;c.fillRect(at.x-5,at.y,11,1);c.fillRect(at.x,at.y-5,1,11);c.fillText(id,at.x+9,at.y-9);
            if(frame.emitter){const anchor=frame.anchor??clip.anchor,scale=clip.scale??1;c.strokeRect(at.x+(frame.emitter.x-anchor.x)*scale-4,at.y+(frame.emitter.y-anchor.y)*scale-4,8,8);}
        }c.restore();
    }
}
