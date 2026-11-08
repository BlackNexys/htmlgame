import type { EnvironmentImages } from '../interfaces/Environment';
import { parseEnvironmentFrames } from './EnvironmentManifest';
import { architectureNames } from './ConfluenceArchitecture';

/** Decorative assets fail independently; missing art never prevents a level loading. */
export class EnvironmentLoader {
    async load(levelId:string|undefined, signal:AbortSignal):Promise<EnvironmentImages|undefined> {
        if(levelId!=='last-platform-demo')return undefined;
        const images:EnvironmentImages={};
        const manifest=fetch('./assets/environment/confluence/v1/atlas-v1.json',{signal}).then(r=>r.ok?r.json():undefined).catch(()=>undefined);
        const architecture=this.architecture(signal,images);
        await Promise.all((['terrain','facades','props','city','landmarks'] as const).map(async name=>{
            const image=await this.image(`./assets/environment/confluence/v1/${name}-v1.png`,signal);
            const sizes={terrain:[192,192],facades:[768,768],props:[768,576],landmarks:[768,512]};
            const size=name==='city'?undefined:sizes[name];
            if(image && (!size || image.naturalWidth===size[0] && image.naturalHeight===size[1]))images[name]=image;
        }));
        const data=await manifest;
        if(images.props){
            try{images.frames=parseEnvironmentFrames(data,images.props.naturalWidth,images.props.naturalHeight);}
            catch{delete images.props;}
        }
        await architecture;
        return Object.keys(images).length?images:undefined;
    }

    private async architecture(signal:AbortSignal,images:EnvironmentImages){
        const [image,data]=await Promise.all([
            this.image('./assets/environment/confluence/v2/architecture-v2.png',signal),
            fetch('./assets/environment/confluence/v2/atlas-v2.json',{signal}).then(r=>r.ok?r.json():undefined).catch(()=>undefined),
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
