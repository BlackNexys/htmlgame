import type {Camera} from '../components/Camera';
import type {SpriteFrame} from '../interfaces/Environment';
import {ConfluenceShadedAtlas} from './ConfluenceShadedAtlas';
import {ConfluenceImageLighting} from './ConfluenceImageLighting';
import {buildingShells,buildingFamilies,buildingTile,insideBuilding,type BuildingShell} from './ConfluenceBuildings';

/** Continuous, quiet material shells behind the separate window and prop passes. */
export class ConfluenceBuildingRenderer {
    private readonly walls:ConfluenceShadedAtlas;
    private readonly trims?:HTMLImageElement|HTMLCanvasElement;
    constructor(private readonly ctx:CanvasRenderingContext2D,walls:HTMLImageElement,trims?:HTMLImageElement,private readonly frames?:Record<string,SpriteFrame>){
        this.walls=new ConfluenceShadedAtlas(ctx,walls);
        if(trims)this.trims=new ConfluenceImageLighting(trims).at(.65);
    }
    draw(camera:Camera){
        for(const b of buildingShells){
            if(!camera.canSee(b,0))continue;
            const c=this.ctx;c.save();c.beginPath();c.rect(b.x,b.y,b.width,b.height);c.clip();
            for(let y=Math.max(Math.floor(b.y/96)*96,Math.floor(camera.y/96)*96);y<b.y+b.height&&y<camera.y+camera.height;y+=96)
                for(let x=Math.max(Math.floor(b.x/96)*96,Math.floor(camera.x/96)*96);x<b.x+b.width&&x<camera.x+camera.width;x+=96)
                    this.walls.at(b.light).draw(buildingTile(b.material,x,y),x,y,96,96);
            // Electrical trunks and short branches follow the shell, never cross open sky.
            if(!b.pier){
                c.fillStyle='#0a1821';c.fillRect(b.x+44,b.y+32,8,b.height-32);
                c.fillStyle='#29515b';c.fillRect(b.x+47,b.y+32,2,b.height-32);
                for(const floor of b.floors){c.fillStyle='#0a1821';c.fillRect(b.x+48,floor-96,b.width-72,6);c.fillStyle='#49344f';c.fillRect(b.x+48,floor-94,b.width-72,2);}
            }
            c.globalAlpha=1;
            for(let y=Math.max(b.y,Math.floor(camera.y/96)*96);y<b.y+b.height&&y<camera.y+camera.height;y+=96){
                if(!insideBuilding(b.group,b.x-1,y+1))this.trim(b,'left',b.x,y,24,96);
                if(!insideBuilding(b.group,b.x+b.width,y+1))this.trim(b,'right',b.x+b.width-24,y,24,96);
            }
            if(!b.pier)for(let x=Math.max(b.x,Math.floor(camera.x/96)*96);x<b.x+b.width&&x<camera.x+camera.width;x+=96){
                if(!insideBuilding(b.group,x+1,b.y-1))this.trim(b,'roof',x,b.y,96,24);
                for(const floor of b.floors)this.trim(b,'band',x,floor-16,96,16);
            }
            c.restore();
        }
    }
    private trim(b:BuildingShell,part:string,x:number,y:number,width:number,height:number){
        const f=this.frames?.[buildingFamilies[b.material]+'-'+part];if(!f||!this.trims)return;
        this.ctx.drawImage(this.trims,f.x,f.y,f.width,f.height,x,y,width,height);
    }
}
