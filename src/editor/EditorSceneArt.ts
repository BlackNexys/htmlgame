import {EnvironmentLoader} from '../environment/EnvironmentLoader';
import {PropRenderer} from '../world/props/PropRenderer';
import {sceneAssetKeys} from '../world/props/SceneAssetKeys';
import type {LevelDocument} from '../levels/LevelDocument';
export class EditorSceneArt {
    renderer:PropRenderer;
    private key='';
    private loading?:AbortController;
    constructor(private readonly ctx:CanvasRenderingContext2D,private readonly redraw:()=>void){this.renderer=new PropRenderer(ctx);}
    update(d:LevelDocument){
        const assets=sceneAssetKeys(d),key=JSON.stringify([...assets].sort());if(key===this.key)return;this.key=key;
        this.loading?.abort();const loading=this.loading=new AbortController();
        void new EnvironmentLoader().load(undefined,loading.signal,false,assets).then(images=>{
            if(loading.signal.aborted)return;this.renderer=new PropRenderer(this.ctx,images);this.redraw();
        }).catch(()=>{if(!loading.signal.aborted){this.renderer=new PropRenderer(this.ctx);this.redraw();}});
    }
}
