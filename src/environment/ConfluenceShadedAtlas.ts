import {ConfluenceAtlas} from './ConfluenceAtlas';
import {ConfluenceImageLighting} from './ConfluenceImageLighting';

/** Cache material lighting without filling transparent pixels in the source. */
export class ConfluenceShadedAtlas {
    private readonly cache=new Map<number,ConfluenceAtlas>();
    private readonly lighting:ConfluenceImageLighting;
    constructor(private readonly ctx:CanvasRenderingContext2D,image:HTMLImageElement,private readonly columns=4,private readonly rows=4){this.lighting=new ConfluenceImageLighting(image);}
    at(light:number){
        let atlas=this.cache.get(light);if(atlas)return atlas;
        atlas=new ConfluenceAtlas(this.ctx,this.lighting.at(light),this.columns,this.rows);this.cache.set(light,atlas);return atlas;
    }
}
