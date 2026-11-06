export interface Point {x: number; y: number;}
export interface Clip {
    id: string; name: string; image: string;
    width: number; height: number; cell: {width: number; height: number};
    anchor: Point; frames: readonly {rect: readonly [number,number,number,number]; durationMs: number}[];
}
export interface PilotManifest {
    version: 1; status: string;
    scene: {width: number; height: number; background: string; hero: Point; platform: Point; post: Point; lamp: Point};
    hero: {head: Point; cape: Point};
    assets: Record<'platform'|'post'|'lamp'|'body'|'flame'|'cape',Clip>;
    palette: {colors: readonly string[]};
}

export function frameAt(clip: Clip, timeMs: number) {
    const duration = clip.frames.reduce((sum,frame)=>sum+frame.durationMs,0);
    let local = Math.max(0,timeMs)%duration;
    for(let i=0;i<clip.frames.length;i++) {
        if(local<clip.frames[i].durationMs)return i;
        local-=clip.frames[i].durationMs;
    }
    return 0;
}

export function validateManifest(value: unknown): asserts value is PilotManifest {
    if (!value || typeof value !== 'object') throw Error('Invalid pilot manifest');
    const data = value as PilotManifest;
    if(data.version!==1||data.scene?.width!==640||data.scene?.height!==360)throw Error('Unexpected pilot scene dimensions');
    if(data.palette?.colors?.length!==32)throw Error('The pilot requires its shared 32-colour palette');
    for(const key of ['platform','post','lamp','body','flame','cape'] as const){
        const clip=data.assets?.[key];
        if(!clip?.image||!clip.frames?.length)throw Error(`Missing ${key} clip`);
        for(const frame of clip.frames){
            const [x,y,width,height]=frame.rect;
            if(![x,y,width,height,frame.durationMs].every(Number.isFinite)||x<0||y<0||width<=0||height<=0||frame.durationMs<=0||x+width>clip.width||y+height>clip.height)throw Error(`Invalid ${key} frame`);
        }
    }
}
