import type {PropDefinition,VisualDefinition,PresentationDefinition} from './PropDefinition';
import {artFor} from './SceneArtCatalog';
function record(value:unknown,keys:string[]):Record<string,unknown>{
    if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Expected an object');
    const r=value as Record<string,unknown>;
    for(const key of Object.keys(r))if(!keys.includes(key))throw Error(`Unknown field: ${key}`);
    return r;
}
function integer(v:unknown,name:string,min:number,max:number){if(typeof v!=='number'||!Number.isInteger(v)||v<min||v>max)throw Error(`${name}: expected integer ${min}..${max}`);return v;}
function asset(v:unknown){if(typeof v!=='string')throw Error('Expected asset key');artFor(v);return v;}
export function parseVisual(value:unknown):VisualDefinition {
    const p=record(value,['asset','openAsset','x','y','width','height']);
    return {asset:asset(p.asset),x:integer(p.x,'visual.x',-32736,32736),y:integer(p.y,'visual.y',-16368,16368),width:integer(p.width,'visual.width',1,32736),height:integer(p.height,'visual.height',1,16368),...(p.openAsset===undefined?{}:{openAsset:asset(p.openAsset)})};
}
export function parsePresentation(value:unknown):PresentationDefinition|undefined {
    if(value===undefined)return;
    const p=record(value,['environment','scenery']);
    if(p.environment!=='confluence'||!['assemblies','authored','construction'].includes(String(p.scenery)))throw Error('Unknown environment or scenery composition');
    return {environment:'confluence',scenery:p.scenery as PresentationDefinition['scenery']};
}
export function parseProps(value:unknown,bounds:{width:number;height:number},objectId:(id:unknown,path:string)=>string):PropDefinition[]{
    if(value===undefined)return [];
    if(!Array.isArray(value)||value.length>1000)throw Error('props must be an array of at most 1000 objects');
    return value.map((v,i)=>{
        const p=record(v,['id','asset','x','y','width','height','mount','layer','depth','light','opacity','flip','stretch']);
        const result:PropDefinition={id:objectId(p.id,`props[${i}]`),asset:asset(p.asset),x:integer(p.x,'x',-bounds.width,bounds.width),y:integer(p.y,'y',-bounds.height,bounds.height),width:integer(p.width,'width',1,bounds.width),height:integer(p.height,'height',1,bounds.height)};
        if(p.mount!==undefined){const m=record(p.mount,['parent','socket']);if(typeof m.parent!=='string'||!/^[a-z][a-z0-9-]{0,79}$/.test(m.parent)||typeof m.socket!=='string'||!m.socket||m.socket.length>80)throw Error('Invalid prop mount');result.mount={parent:m.parent,socket:m.socket};}
        if(p.layer!==undefined){if(!['rear','foreground'].includes(String(p.layer)))throw Error('Unknown prop layer');result.layer=p.layer as PropDefinition['layer'];}
        if(p.depth!==undefined)result.depth=integer(p.depth,'depth',-1024,1024);
        for(const field of ['light','opacity'] as const)if(p[field]!==undefined)result[field]=integer(p[field],field,1,100);
        for(const field of ['flip','stretch'] as const)if(p[field]!==undefined){if(typeof p[field]!=='boolean')throw Error(`${field} must be boolean`);result[field]=p[field];}
        return result;
    });
}
