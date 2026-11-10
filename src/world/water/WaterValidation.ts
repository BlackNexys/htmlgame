import {waterKinds,type WaterDefinition,type WaterEndpoint} from './WaterDefinition';

/** Water's own authoring validation; cross-object geometry is validated by WaterNetwork. */
export function parseWaterDefinitions(input:unknown,bounds:{width:number;height:number},recordId:(id:unknown,path:string)=>string):WaterDefinition[]{
    if(input===undefined)return [];
    if(!Array.isArray(input)||input.length>1000)throw Error('water: expected an array of at most 1000 elements');
    return input.map((raw,index)=>{
        const path=`water[${index}]`;
        if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error(`${path}: expected an object`);
        const p=raw as Record<string,unknown>,kind=p.kind as WaterDefinition['kind'];
        if(!waterKinds.includes(kind))throw Error(`${path}.kind: unknown water kind`);
        const keys=['id','kind','x','y','width','depth',...(kind==='waterfall'?['from','to','overRim','behindTerrain']:['height','mount',...(kind==='drain'?['profile','outletX']:['current'])])];
        for(const key of Object.keys(p))if(!keys.includes(key))throw Error(`${path}.${key}: unknown field`);
        const num=(key:string,min:number,max:number,fallback?:number)=>{
            const value=p[key]??fallback;
            if(typeof value!=='number'||!Number.isInteger(value)||value<min||value>max)throw Error(`${path}.${key}: expected an integer between ${min} and ${max}`);
            return value;
        };
        const endpoint=(value:unknown,label:string):WaterEndpoint=>{
            if(!value||typeof value!=='object'||Array.isArray(value))throw Error(`${path}.${label}: expected parent and socket`);
            const ref=value as Record<string,unknown>;
            if(Object.keys(ref).some(k=>!['parent','socket'].includes(k))||typeof ref.parent!=='string'||!/^[a-z][a-z0-9-]{0,79}$/.test(ref.parent)||typeof ref.socket!=='string'||!ref.socket.trim()||ref.socket.length>80)throw Error(`${path}.${label}: invalid socket reference`);
            return {parent:ref.parent,socket:ref.socket};
        };
        const offsets=kind==='waterfall'||p.mount!==undefined;
        const common={id:recordId(p.id,path),kind,x:num('x',offsets?-bounds.width:0,bounds.width,kind==='waterfall'?0:undefined),y:num('y',offsets?-bounds.height:0,bounds.height,kind==='waterfall'?0:undefined),width:num('width',1,bounds.width),...(p.depth===undefined?{}:{depth:num('depth',-1024,1024)})};
        if(kind==='waterfall'){
            if(typeof p.to!=='string'||!/^[a-z][a-z0-9-]{0,79}$/.test(p.to))throw Error(`${path}.to: invalid receiving water ID`);
            for(const key of ['overRim','behindTerrain'])if(p[key]!==undefined&&typeof p[key]!=='boolean')throw Error(`${path}.${key}: expected boolean`);
            return {...common,kind,from:endpoint(p.from,'from'),to:p.to,...(p.overRim===undefined?{}:{overRim:p.overRim as boolean}),...(p.behindTerrain===undefined?{}:{behindTerrain:p.behindTerrain as boolean})};
        }
        const placed={...common,height:num('height',1,bounds.height),...(p.mount===undefined?{}:{mount:endpoint(p.mount,'mount')})};
        if(kind==='drain'){
            if(p.profile!==undefined&&!['gutter','collector'].includes(String(p.profile)))throw Error(`${path}.profile: unknown drain profile`);
            return {...placed,kind,...(p.profile===undefined?{}:{profile:p.profile as 'gutter'|'collector'}),...(p.outletX===undefined?{}:{outletX:num('outletX',0,common.width)})};
        }
        return {...placed,kind,...(p.current===undefined?{}:{current:num('current',-100,100)})};
    });
}
