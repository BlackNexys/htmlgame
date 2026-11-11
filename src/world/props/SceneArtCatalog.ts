import atlas from '../../../public/assets/environment/confluence/v4/atlas-v4.json';
import architecture from '../../../public/assets/environment/confluence/v6/architecture-v6.json';
import landmarks from '../../../public/assets/environment/confluence/v6/landmarks-v6.json';
import trims from '../../../public/assets/environment/confluence/v5/trims-v5.json';
import type {SpriteFrame} from '../../interfaces/Environment';
export interface SceneArt {pack:'props'|'canopy'|'facades'|'architecture'|'landmarks'|'buildingWalls'|'buildingTrims'|'terrain';frame:SpriteFrame;stretch?:boolean;tile?:number;variants?:SpriteFrame[];}
const entries:Record<string,SceneArt>={};
for(const [name,frame] of Object.entries(atlas.frames))entries[`confluence-${name.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}`]={pack:'props',frame,stretch:name.startsWith('shutter')};
entries['confluence-canopy']={pack:'canopy',frame:{x:0,y:0,width:480,height:198}};
for(let i=0;i<16;i++)entries[`confluence-inset-${i}`]={pack:'facades',frame:{x:i%4*192,y:Math.floor(i/4)*192,width:192,height:192}};
for(const [name,frame] of Object.entries(architecture.frames))entries[`confluence-architecture-${name}`]={pack:'architecture',frame};
for(const [name,frame] of Object.entries(landmarks.frames))entries[`confluence-landmark-${name}`]={pack:'landmarks',frame};
for(const [name,frame] of Object.entries(trims.frames))entries[`confluence-trim-${name}`]={pack:'buildingTrims',frame,stretch:true};
for(let family=0;family<4;family++){
    const variants=Array.from({length:4},(_,i)=>({x:i*96,y:family*96,width:96,height:96}));
    entries[`confluence-wall-${family}`]={pack:'buildingWalls',frame:variants[0],tile:96,variants};
}
entries['confluence-steel-beam']={pack:'terrain',frame:{x:144,y:48,width:48,height:48},tile:48};
export const sceneArt:Readonly<Record<string,SceneArt>>=Object.freeze(entries);
export function artFor(asset:string):SceneArt {
    if(!Object.hasOwn(sceneArt,asset))throw Error(`Unknown scene asset: ${asset}`);
    return sceneArt[asset];
}
