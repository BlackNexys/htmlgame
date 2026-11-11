import type {Camera} from '../../components/Camera';

/** Local foam and droplets, driven solely by simulation time. */
export class WaterImpactRenderer {
    constructor(private readonly ctx:CanvasRenderingContext2D){}
    draw(x:number,y:number,width:number,camera:Camera,time:number){
        if(!camera.canSee({x:x-100,y:y-48,width:200,height:80},0))return;
        const c=this.ctx;c.save();
        for(let i=0;i<3;i++){
            const age=(time*.7+i/3)%1;c.globalAlpha=(1-age)*.5;c.strokeStyle='#93e8e5';c.lineWidth=1;
            c.beginPath();c.ellipse(x,y+3,width/2+age*52,3+age*9,0,0,Math.PI*2);c.stroke();
        }
        for(let i=0;i<12;i++){
            const t=(time*1.1+i*.137)%1,v=(i%2?1:-1)*(8+i*2);
            c.globalAlpha=(1-t)*.65;c.fillStyle=i%3?'#65c8d5':'#d2ffff';
            c.fillRect(Math.round(x+v*t),Math.round(y-4-48*t*(1-t)),2,3);
        }
        c.restore();
    }
}
