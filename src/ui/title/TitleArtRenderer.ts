import {artFrame,type Point,type TitleArt} from './TitleArt';

/** Authored frame playback over stationary image layers. No deformation of painted pixels. */
export class TitleArtRenderer {
    private readonly c: CanvasRenderingContext2D;
    constructor(readonly canvas: HTMLCanvasElement,readonly art: TitleArt,private readonly images: ReadonlyMap<string,HTMLImageElement>){
        const c=canvas.getContext('2d');if(!c)throw Error('Decorative canvas unavailable');
        this.c=c;c.imageSmoothingEnabled=false;
    }
    draw(timeMs: number,poseId: string){
        const c=this.c,a=this.art,t=timeMs/1000,pose=a.heroes[poseId];
        c.clearRect(0,0,a.width,a.height);
        this.souls(t);
        // Shadows precede the character; the lantern is the local key light.
        if(pose){
            this.shadow(pose.ground,a.lamp.position);
            const body=a.clips[pose.body],scale=body.scale??1;
            this.halo({x:pose.position.x+(pose.light.x-body.anchor.x)*scale*(body.mirror?-1:1),y:pose.position.y+(pose.light.y-body.anchor.y)*scale},45,'238,49,168',.055);
            // Each frame is the complete familiar gameplay character, including
            // face, flame, clothing and cloak. No separate head/cape compositing.
            this.clip(pose.body,pose.position,timeMs);
        }
        // Slow rigid swing around the real hanging link. The supporting post never moves.
        const angle=Math.sin(t*Math.PI*2/7.6)*.012;
        c.save();c.translate(a.lamp.position.x,a.lamp.position.y);c.rotate(angle);this.clip('lamp',{x:0,y:0},0);c.restore();
        const lamp=a.clips.lamp,dx=a.lamp.glass.x-lamp.anchor.x,dy=a.lamp.glass.y-lamp.anchor.y;
        const glass={x:a.lamp.position.x+dx*Math.cos(angle)-dy*Math.sin(angle),y:a.lamp.position.y+dx*Math.sin(angle)+dy*Math.cos(angle)};
        this.halo(glass,100,'66,217,238',.075+.012*Math.sin(t*2.7)+.008*Math.sin(t*4.3));
        this.clock(t);
        this.board();
        this.clip('cat',a.cat,timeMs);
        this.sleep(t);
        a.vines.forEach((position,index)=>this.clip('vines',position,timeMs+index*430));
        this.canvas.dataset.actorFrame=pose?String(artFrame(a.clips[pose.body],timeMs)):'absent';
        this.canvas.dataset.catFrame=String(artFrame(a.clips.cat,timeMs));
        this.canvas.dataset.time=String(Math.round(timeMs));
    }
    private clip(id: string,position: Point,timeMs: number){
        const clip=this.art.clips[id],frame=clip.frames[artFrame(clip,timeMs)];
        const anchor=frame.anchor??clip.anchor,scale=clip.scale??1;
        this.c.save();this.c.translate(Math.round(position.x),Math.round(position.y));if(clip.mirror)this.c.scale(-1,1);
        this.c.drawImage(this.images.get(id)!,...frame.rect,Math.round(-anchor.x*scale),Math.round(-anchor.y*scale),frame.rect[2]*scale,frame.rect[3]*scale);this.c.restore();
    }
    private halo(at: Point,radius: number,color: string,alpha: number){
        const c=this.c;c.save();c.globalCompositeOperation='screen';
        const fill=c.createRadialGradient(at.x,at.y,0,at.x,at.y,radius);
        fill.addColorStop(0,`rgba(${color},${alpha})`);fill.addColorStop(1,`rgba(${color},0)`);
        c.fillStyle=fill;c.fillRect(at.x-radius,at.y-radius,radius*2,radius*2);c.restore();
    }
    private shadow(at: Point,light: Point){
        const c=this.c,angle=Math.atan2((at.y-light.y)*.2,at.x-light.x);
        c.save();c.translate(at.x,at.y);c.rotate(angle);c.scale(1,.25);
        const cast=c.createRadialGradient(25,0,0,25,0,70);cast.addColorStop(0,'rgba(5,9,17,.26)');cast.addColorStop(1,'rgba(5,9,17,0)');c.fillStyle=cast;c.fillRect(-45,-70,140,140);c.restore();
        c.save();c.translate(at.x,at.y);c.scale(1,.2);
        const contact=c.createRadialGradient(0,0,0,0,0,42);contact.addColorStop(0,'rgba(5,9,17,.45)');contact.addColorStop(1,'rgba(5,9,17,0)');c.fillStyle=contact;c.fillRect(-42,-42,84,84);c.restore();
    }
    private clock(time: number){
        const c=this.c,{position,radius}=this.art.clock;
        c.save();c.translate(position.x,position.y);
        for(const [angle,length,width,color]of [[-.45+time*Math.PI*2/43200,radius*.52,4,'#252332'],[.7+time*Math.PI*2/3600,radius*.75,3,'#252332'],[time*Math.PI*2/60,radius*.83,1.5,'#9f4b68']] as const){
            c.save();c.rotate(angle);c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(0,8);c.lineTo(0,-length);c.stroke();c.restore();
        }
        c.fillStyle='#292536';c.beginPath();c.arc(0,0,4,0,Math.PI*2);c.fill();c.restore();
    }
    private board(){
        const c=this.c,b=this.art.board;c.save();c.translate(b.position.x,b.position.y);c.rotate(b.angle);
        c.fillStyle='#e8bb77';c.textAlign='center';c.textBaseline='middle';c.font='bold 15px monospace';
        c.fillText('DEPARTURES:',0,-10,b.width);c.font='bold 14px monospace';c.fillText('ETERNALLY DELAYED.',0,12,b.width);c.restore();
    }
    private sleep(time: number){
        const c=this.c,at=this.art.cat;
        for(let i=0;i<3;i++){
            const phase=(time/4+i/3)%1;c.globalAlpha=Math.sin(phase*Math.PI)*.7;c.fillStyle='#e5dbe8';c.font=`bold ${10+i*2}px monospace`;
            c.fillText(i?'Z':'z',Math.round(at.x-8+phase*24),Math.round(at.y-18-phase*38));
        }
        c.globalAlpha=1;
    }
    private souls(time: number){
        const c=this.c;
        for(let i=0;i<2;i++){
            const phase=(time/(32+i*11)+.18+i*.4)%1,visible=Math.max(0,Math.sin(phase*Math.PI*2));
            c.globalAlpha=visible*.25;
            this.clip('soul',{x:780+i*280+phase*170,y:540+i*75-phase*70},time*1000+i*170);
        }
        c.globalAlpha=1;
    }
}
