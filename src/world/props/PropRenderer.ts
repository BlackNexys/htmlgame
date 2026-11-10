import type {EnvironmentImages} from '../../interfaces/Environment';
import type {Rect} from '../../interfaces/Geometry';
import {artFor} from './SceneArtCatalog';
import type {PropDefinition} from './PropDefinition';
import {ConfluenceImageLighting} from '../../environment/ConfluenceImageLighting';
export class PropRenderer {
    private readonly lighting=new WeakMap<HTMLImageElement,ConfluenceImageLighting>();
    constructor(private readonly ctx:CanvasRenderingContext2D,private readonly images?:EnvironmentImages){}
    draw(asset:string,r:Rect,style:Partial<PropDefinition>={},view?:Rect){
        const c=this.ctx,art=artFor(asset),im=this.images?.[art.pack],f=art.frame;
        c.save();c.globalAlpha*=(style.opacity??100)/100;
        if(style.flip){c.translate(r.x*2+r.width,0);c.scale(-1,1);}
        if(im){
            let lighting=this.lighting.get(im);if(!lighting){lighting=new ConfluenceImageLighting(im);this.lighting.set(im,lighting);}const image=lighting.at((style.light??100)/100);
            if(art.tile){
                // Mirroring reverses the sampled region. Draw the full clipped strip
                // for this uncommon case rather than culling the wrong end of it.
                const tileView=style.flip?undefined:view;
                const size=art.tile;c.beginPath();c.rect(r.x,r.y,r.width,r.height);c.clip();
                for(let y=Math.floor(Math.max(r.y,tileView?.y??r.y)/size)*size;y<Math.min(r.y+r.height,tileView?tileView.y+tileView.height:r.y+r.height);y+=size)
                    for(let x=Math.floor(Math.max(r.x,tileView?.x??r.x)/size)*size;x<Math.min(r.x+r.width,tileView?tileView.x+tileView.width:r.x+r.width);x+=size){const frame=art.variants?.[((Math.imul(Math.floor(x/size),13)^Math.imul(Math.floor(y/size),7))>>>0)%4]??f;c.drawImage(image,frame.x,frame.y,frame.width,frame.height,x,y,size,size);}
            }else{
                const stretch=style.stretch??art.stretch,scale=Math.min(r.width/f.width,r.height/f.height),w=stretch?r.width:Math.round(f.width*scale),h=stretch?r.height:Math.round(f.height*scale);
                c.drawImage(image,f.x,f.y,f.width,f.height,Math.round(r.x+(r.width-w)/2),Math.round(r.y+r.height-h),w,h);
            }
        }else{c.save();c.fillStyle='#203642';c.fillRect(r.x,r.y,r.width,r.height);c.strokeStyle='#60828b';c.strokeRect(r.x,r.y,r.width,r.height);c.restore();}
        c.restore();
    }
}
