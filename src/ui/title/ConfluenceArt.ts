import type { ArtClip, Point } from './TitleArt';

export interface SceneImage {file: string; width: number; height: number; optional?: boolean;}
export interface SceneClip extends ArtClip {
    position: Point;
    frames: (ArtClip['frames'][number] & {emitter?: Point; intensity?: number})[];
}
interface LayerBase {id: string; mask?: Point[];}
export type ConfluenceLayer = LayerBase & (
    {kind: 'image'; image: string; position: Point} |
    {kind: 'clip'; clip: string; offsetMs?: number} |
    {kind: 'water'; clip: string; speed: number; opacity: number} |
    {kind: 'reflection'; clip: string; sourceClip: string; opacity: number} |
    {kind: 'train'; clip: string; from: Point; to: Point; firstMs: number; durationMs: number; gapMs: [number,number]} |
    {kind: 'mist'; region: [number,number,number,number]} |
    {kind: 'shadows'; contacts: {position: Point; width: number; height: number; opacity: number}[]} |
    {kind: 'lights'; sourceClip: string; points: {position: Point; radius: number; color: string; opacity: number}[]} |
    {kind: 'screen'; position: Point; width: number; height: number; angle: number} |
    {kind: 'sleep'; position: Point}
);
export interface ConfluenceArt {
    version: 2; width: 1672; height: 941; poster: string;
    images: Record<string,SceneImage>; clips: Record<string,SceneClip>; layers: ConfluenceLayer[];
}

const finite=(v: unknown): v is number=>typeof v==='number'&&Number.isFinite(v);
const positive=(v: unknown)=>finite(v)&&v>0;
const point=(p: Point)=>p&&finite(p.x)&&finite(p.y);
const bounded=(v: unknown)=>finite(v)&&v>=0&&v<=1;

export function validateConfluenceArt(value: unknown): asserts value is ConfluenceArt {
    if(!value||typeof value!=='object')throw Error('Missing Confluence title metadata');
    const a=value as ConfluenceArt;
    if(a.version!==2||a.width!==1672||a.height!==941||!a.poster)throw Error('Unexpected Confluence title format');
    if(!a.images||!a.clips||!Array.isArray(a.layers)||!a.layers.length)throw Error('Missing Confluence title assets');
    for(const [id,im]of Object.entries(a.images)){
        if(!im||!im.file||/^(?:\/|\w+:)/.test(im.file)||!im.file.endsWith('.png')||![im.width,im.height].every(v=>positive(v)&&Number.isInteger(v))||im.optional!==undefined&&typeof im.optional!=='boolean')throw Error(`Invalid title image: ${id}`);
    }
    const bytes=Object.values(a.images).reduce((sum,im)=>sum+im.width*im.height*4,0);
    if(bytes>64*1024*1024)throw Error('Confluence title images exceed the art memory budget');
    for(const[id,clip]of Object.entries(a.clips)){
        const im=a.images[clip.image];
        if(!im||im.width!==clip.width||im.height!==clip.height||!point(clip.anchor)||!point(clip.position)||!clip.frames?.length||clip.scale!==undefined&&!positive(clip.scale)||clip.mirror!==undefined&&typeof clip.mirror!=='boolean')throw Error(`Invalid title clip: ${id}`);
        for(const frame of clip.frames){
            const [x,y,w,h]=frame.rect??[];
            if(![x,y,w,h].every(finite)||x<0||y<0||!positive(w)||!positive(h)||x+w>im.width||y+h>im.height||!positive(frame.durationMs)||frame.anchor&&!point(frame.anchor)||frame.emitter&&!point(frame.emitter)||frame.intensity!==undefined&&!bounded(frame.intensity))throw Error(`Invalid title frame: ${id}`);
            const anchor=frame.anchor??clip.anchor;
            if(anchor.x<0||anchor.x>w||anchor.y<0||anchor.y>h||frame.emitter&&(frame.emitter.x<0||frame.emitter.x>w||frame.emitter.y<0||frame.emitter.y>h))throw Error(`Unbounded title attachment: ${id}`);
        }
    }
    const ids=new Set<string>();
    for(const layer of a.layers){
        if(!layer.id||ids.has(layer.id))throw Error('Duplicate or missing title layer id');ids.add(layer.id);
        if(layer.mask&&(layer.mask.length<3||!layer.mask.every(p=>point(p)&&p.x>=0&&p.x<=a.width&&p.y>=0&&p.y<=a.height)))throw Error(`Invalid title mask: ${layer.id}`);
        if(layer.mask&&Math.abs(layer.mask.reduce((sum,p,i)=>{const next=layer.mask![(i+1)%layer.mask!.length];return sum+p.x*next.y-next.x*p.y;},0))<2)throw Error('Title mask has no area');
        switch(layer.kind){
            case 'image': if(!a.images[layer.image]||!point(layer.position))throw Error('Invalid static title layer');break;
            case 'clip': if(!a.clips[layer.clip]||layer.offsetMs!==undefined&&!finite(layer.offsetMs))throw Error('Invalid animated title layer');break;
            case 'water': if(!a.clips[layer.clip]||!layer.mask||!finite(layer.speed)||!bounded(layer.opacity))throw Error('Invalid title water');break;
            case 'reflection': if(!a.clips[layer.clip]||!a.clips[layer.sourceClip]||!layer.mask||!bounded(layer.opacity))throw Error('Invalid title reflection');break;
            case 'train': if(!a.clips[layer.clip]||!point(layer.from)||!point(layer.to)||!finite(layer.firstMs)||layer.firstMs<0||!positive(layer.durationMs)||!layer.gapMs?.every(positive)||layer.gapMs.length!==2||layer.gapMs[1]<layer.gapMs[0]||!layer.mask)throw Error('Invalid title train track');break;
            case 'mist': if(layer.region?.length!==4||!layer.region.every(finite)||!positive(layer.region[2])||!positive(layer.region[3])||!layer.mask)throw Error('Invalid title atmosphere');break;
            case 'shadows': if(!layer.contacts?.every(c=>point(c.position)&&positive(c.width)&&positive(c.height)&&bounded(c.opacity)))throw Error('Invalid title contacts');break;
            case 'lights': if(!a.clips[layer.sourceClip]||!layer.points?.every(p=>point(p.position)&&positive(p.radius)&&/^#[\da-f]{6}$/i.test(p.color)&&bounded(p.opacity)))throw Error('Invalid title lights');break;
            case 'screen': if(!point(layer.position)||!positive(layer.width)||!positive(layer.height)||!finite(layer.angle))throw Error('Invalid title display');break;
            case 'sleep': if(!point(layer.position))throw Error('Invalid title sleep marks');break;
            default: throw Error('Unknown title layer kind');
        }
    }
    if(!a.clips.cole||a.images[a.clips.cole.image].optional||!a.layers.some(l=>l.kind==='image'&&!a.images[l.image].optional)||!a.layers.some(l=>l.kind==='clip'&&l.clip==='cole'))throw Error('Missing core Confluence title layers');
}

/** Repeatable visit-specific spacing; independent of display rate and wall time. */
export function trainPhase(layer: Extract<ConfluenceLayer,{kind:'train'}>,timeMs: number,seed=0): number | undefined {
    const mixed=(Math.imul(seed^0x45d9f3b,0x45d9f3b)>>>0)/4294967296;
    const gap=layer.gapMs[0]+mixed*(layer.gapMs[1]-layer.gapMs[0]);
    if(timeMs<layer.firstMs)return undefined;
    const local=(timeMs-layer.firstMs)%(layer.durationMs+gap);
    return local<layer.durationMs?local/layer.durationMs:undefined;
}

export async function loadConfluenceArt(root: string,signal?: AbortSignal) {
    const response=await fetch(root+'scene-v2.json',{signal});if(!response.ok)throw Error('Confluence menu metadata unavailable');
    const art: unknown=await response.json();validateConfluenceArt(art);
    const images=new Map<string,HTMLImageElement>();
    await Promise.all(Object.entries(art.images).map(async([id,description])=>{
        try{
            const image=await new Promise<HTMLImageElement>((resolve,reject)=>{
                const im=new Image(),finish=(error?: Error)=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);im.onload=im.onerror=null;error?reject(error):resolve(im);};
                const abort=()=>finish(new Error('Title artwork loading cancelled'));
                const timer=window.setTimeout(()=>finish(new Error('Title artwork timed out')),15000);
                im.onload=()=>finish();im.onerror=()=>finish(new Error(`Title artwork unavailable: ${id}`));
                if(signal?.aborted){abort();return;}signal?.addEventListener('abort',abort,{once:true});im.src=root+description.file;
            });
            if(image.naturalWidth!==description.width||image.naturalHeight!==description.height)throw Error(`Confluence image dimensions differ: ${id}`);
            images.set(id,image);
        }catch(error){if(!description.optional||signal?.aborted)throw error;}
    }));
    return {art,images};
}
