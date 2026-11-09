import type { EnvironmentImages } from '../interfaces/Environment';
import { parseEnvironmentFrames } from './EnvironmentManifest';
import { architectureNames } from './ConfluenceArchitecture';
import {buildingTrimNames} from './ConfluenceBuildings';
import {landmarkNames} from './ConfluenceLandmarks';
import { parseTerrainBaselines } from './TerrainManifest';

/** Decorative assets fail independently; missing art never prevents a level loading. */
export class EnvironmentLoader {
    async load(levelId:string|undefined, signal:AbortSignal):Promise<EnvironmentImages|undefined> {
        if(levelId!=='last-platform-demo' && levelId!=='last-platform-rebuild')return undefined;
        const images:EnvironmentImages={};
        if(levelId==='last-platform-rebuild')images.layout='rebuild';
        const manifest=fetch('./assets/environment/confluence/v4/atlas-v4.json',{signal}).then(r=>r.ok?r.json():undefined).catch(()=>undefined);
        const baselines=fetch('./assets/environment/confluence/v4/terrain-v4.json',{signal}).then(r=>r.ok?r.json():undefined).catch(()=>undefined);
        const architecture=this.architecture(signal,images);
        const buildings=this.buildings(signal,images);
        const drainage=levelId==='last-platform-rebuild'?this.drainage(signal,images):Promise.resolve();
        const landmarkData=fetch('./assets/environment/confluence/v6/landmarks-v6.json',{signal}).then(r=>r.ok?r.json():undefined).catch(()=>undefined);
        const files={terrain:['v4/terrain-v4.png',192,192],facades:['v6/insets-v6.png',768,768],props:['v4/props-v4.png',768,576],city:['v3/city-v3.png',0,0],landmarks:['v3/landmarks-v3.png',768,512],water:['v4/water-v4.png',512,256],canopy:['v6/canopy-v6.png',480,198]} as const;
        await Promise.all(Object.entries(files).map(async([name,[file,width,height]])=>{
            const image=await this.image(`./assets/environment/confluence/${file}`,signal);
            if(image && (!width || image.naturalWidth===width && image.naturalHeight===height))images[name as keyof typeof files]=image;
        }));
        const terrainData=await baselines;
        if(images.terrain)try{images.terrainBaselines=parseTerrainBaselines(terrainData);}catch{/* Art remains usable without cap alignment metadata. */}
        const data=await manifest;
        if(images.props){
            try{images.frames=parseEnvironmentFrames(data,images.props.naturalWidth,images.props.naturalHeight);}
            catch{delete images.props;}
        }
        const landmarkFrames=await landmarkData;
        if(images.landmarks)try{images.landmarkFrames=parseEnvironmentFrames(landmarkFrames,768,512,landmarkNames);}catch{delete images.landmarks;}
        await Promise.all([architecture,buildings,drainage]);
        return Object.keys(images).length?images:undefined;
    }

    private async drainage(signal:AbortSignal,images:EnvironmentImages){
        const root='./assets/environment/confluence/v7/';
        const [image,data]=await Promise.all([this.image(root+'drainage-v7.png',signal),fetch(root+'drainage-v7.json',{signal}).then(r=>r.ok?r.json():undefined).catch(()=>undefined)]);
        if(image?.naturalWidth!==768||image.naturalHeight!==768)return;
        try{images.drainageFrames=parseEnvironmentFrames(data,768,768,['sluice','downpipe','outlet','basin','pipeShaft']);images.drainage=image;}
        catch{/* Cosmetic drainage never blocks a level from loading. */}
    }

    private async buildings(signal:AbortSignal,images:EnvironmentImages){
        const root='./assets/environment/confluence/v5/';
        const [walls,trims,data]=await Promise.all([
            this.image(root+'walls-v5.png',signal),this.image(root+'trims-v5.png',signal),
            fetch(root+'trims-v5.json',{signal}).then(r=>r.ok?r.json():undefined).catch(()=>undefined),
        ]);
        if(walls?.naturalWidth===384&&walls.naturalHeight===384)images.buildingWalls=walls;
        if(trims?.naturalWidth!==768||trims.naturalHeight!==768)return;
        try{images.buildingFrames=parseEnvironmentFrames(data,768,768,buildingTrimNames);images.buildingTrims=trims;}
        catch{/* Walls and existing scenery remain usable without optional trims. */}
    }

    private async architecture(signal:AbortSignal,images:EnvironmentImages){
        const [image,data]=await Promise.all([
            this.image('./assets/environment/confluence/v6/architecture-v6.png',signal),
            fetch('./assets/environment/confluence/v6/architecture-v6.json',{signal}).then(r=>r.ok?r.json():undefined).catch(()=>undefined),
        ]);
        if(!image || image.naturalWidth!==1024 || image.naturalHeight!==768)return;
        try{images.architectureFrames=parseEnvironmentFrames(data,1024,768,architectureNames);images.architecture=image;}
        catch{/* Optional scenery: other layers and gameplay remain available. */}
    }

    private image(src:string,signal:AbortSignal):Promise<HTMLImageElement|undefined> {
        return new Promise(resolve=>{
            if(signal.aborted){resolve(undefined);return;}
            const image=new Image();
            const finish=(loaded:boolean)=>{
                clearTimeout(timer);signal.removeEventListener('abort',abort);
                image.onload=image.onerror=null;
                resolve(loaded && image.naturalWidth>0?image:undefined);
            };
            const abort=()=>{finish(false);image.src='';};
            const timer=window.setTimeout(()=>finish(false),10000);
            signal.addEventListener('abort',abort,{once:true});
            image.onload=()=>finish(true);image.onerror=()=>finish(false);image.src=src;
        });
    }
}
