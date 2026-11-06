import {frameAt,type Clip,type PilotManifest,type Point} from './Manifest';

export interface PilotOptions {lighting: boolean; anchors: boolean;}
export class PilotRenderer {
    private readonly ctx: CanvasRenderingContext2D;
    constructor(readonly canvas: HTMLCanvasElement,readonly manifest: PilotManifest,readonly images: ReadonlyMap<string,HTMLImageElement>,private readonly emission: HTMLImageElement){
        const c=canvas.getContext('2d');if(!c)throw Error('The preview could not create a canvas renderer.');
        this.ctx=c;c.imageSmoothingEnabled=false;
    }
    draw(timeMs: number,options: PilotOptions){
        const c=this.ctx,{scene,assets,hero}=this.manifest,t=timeMs/1000;
        c.clearRect(0,0,scene.width,scene.height);c.fillStyle=scene.background;c.fillRect(0,0,scene.width,scene.height);
        this.clip(assets.platform,scene.platform,0);
        this.clip(assets.post,scene.post,0);
        if(options.lighting)this.shadows(scene.hero,scene.lamp);
        const origin={x:scene.hero.x-assets.body.anchor.x,y:scene.hero.y-assets.body.anchor.y};
        const head={x:origin.x+hero.head.x,y:origin.y+hero.head.y};
        const cape={x:origin.x+hero.cape.x,y:origin.y+hero.cape.y};
        if(options.lighting)this.halo(head,19,'236,63,174',.11);
        this.clip(assets.cape,cape,timeMs);
        this.clip(assets.flame,head,timeMs);
        this.clip(assets.body,scene.hero,timeMs);
        this.embers(head,t);
        const angle=Math.sin(t*Math.PI*2/6.8)*Math.PI/180;
        c.save();c.translate(scene.lamp.x,scene.lamp.y);c.rotate(angle);
        this.clip(assets.lamp,{x:0,y:0},0);
        if(options.lighting){
            c.globalCompositeOperation='screen';c.globalAlpha=.16+.025*Math.sin(t*2.8)+.015*Math.sin(t*5.9);
            c.drawImage(this.emission,-assets.lamp.anchor.x,-assets.lamp.anchor.y);
        }
        c.restore();
        if(options.lighting){
            const dx=16-assets.lamp.anchor.x,dy=35-assets.lamp.anchor.y;
            this.halo({x:scene.lamp.x+dx*Math.cos(angle)-dy*Math.sin(angle),y:scene.lamp.y+dx*Math.sin(angle)+dy*Math.cos(angle)},43,'72,187,202',.07);
        }
        if(options.anchors){
            this.marker(scene.hero,'#f1e6dc');this.marker(head,'#ff90d8');this.marker(cape,'#bd427e');this.marker(scene.lamp,'#b3f5ed');this.marker(scene.post,'#e0b786');
        }
        this.canvas.dataset.flameFrame=String(frameAt(assets.flame,timeMs));
        this.canvas.dataset.capeFrame=String(frameAt(assets.cape,timeMs));
        this.canvas.dataset.bodyFrame=String(frameAt(assets.body,timeMs));
    }
    private clip(clip: Clip,position: Point,timeMs: number){
        const frame=clip.frames[frameAt(clip,timeMs)];
        this.ctx.drawImage(this.images.get(clip.id)!,...frame.rect,position.x-clip.anchor.x,position.y-clip.anchor.y,frame.rect[2],frame.rect[3]);
    }
    private halo(at: Point,radius: number,color: string,alpha: number){
        const c=this.ctx;c.save();c.globalCompositeOperation='screen';
        const gradient=c.createRadialGradient(at.x,at.y,0,at.x,at.y,radius);gradient.addColorStop(0,`rgba(${color},${alpha})`);gradient.addColorStop(1,`rgba(${color},0)`);
        c.fillStyle=gradient;c.fillRect(at.x-radius,at.y-radius,radius*2,radius*2);c.restore();
    }
    private shadows(feet: Point,lamp: Point){
        const c=this.ctx,dx=feet.x-lamp.x,dy=(feet.y-lamp.y)*.25,angle=Math.atan2(dy,dx);
        c.save();c.translate(feet.x,feet.y);c.rotate(angle);c.scale(1,.3);
        const cast=c.createRadialGradient(8,0,0,8,0,22);cast.addColorStop(0,'rgba(5,8,15,.35)');cast.addColorStop(1,'rgba(5,8,15,0)');
        c.fillStyle=cast;c.fillRect(-14,-22,44,44);c.restore();
        c.save();c.translate(feet.x,feet.y);c.scale(1,.22);
        const contact=c.createRadialGradient(0,0,0,0,0,18);contact.addColorStop(0,'rgba(5,8,15,.68)');contact.addColorStop(1,'rgba(5,8,15,0)');
        c.fillStyle=contact;c.fillRect(-18,-18,36,36);c.restore();
    }
    private embers(head: Point,time: number){
        const c=this.ctx;
        for(let i=0;i<3;i++){
            const phase=(time*.31+i*.37)%1;
            c.globalAlpha=Math.sin(phase*Math.PI)*.6;c.fillStyle=i%2?'#ff90d8':'#ec3fae';
            c.fillRect(Math.round(head.x+12+phase*22),Math.round(head.y-13-phase*22),1,1);
        }
        c.globalAlpha=1;
    }
    private marker(point: Point,color: string){
        const c=this.ctx;c.fillStyle=color;c.fillRect(point.x-3,point.y,7,1);c.fillRect(point.x,point.y-3,1,7);
    }
}
