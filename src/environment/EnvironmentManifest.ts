import type { SpriteFrame } from '../interfaces/Environment';
import { propNames } from './ConfluenceScene';

export function parseEnvironmentFrames(value:unknown,width:number,height:number,names:readonly string[]=propNames):Record<string,SpriteFrame>{
    const data=value as {version?:unknown;frames?:Record<string,SpriteFrame>};
    if(data?.version!==1 || !data.frames || typeof data.frames!=='object' || Array.isArray(data.frames))throw Error('Invalid environment atlas');
    for(const name of names){
        const f=data.frames[name];
        if(!f || ![f.x,f.y,f.width,f.height].every(Number.isInteger) || f.x<0 || f.y<0 || f.width<1 || f.height<1 || f.x+f.width>width || f.y+f.height>height)throw Error('Invalid environment sprite frame');
    }
    if(Object.keys(data.frames).length!==names.length)throw Error('Unknown environment sprite');
    return structuredClone(data.frames);
}
