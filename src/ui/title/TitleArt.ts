export interface Point {x: number; y: number;}
export interface ArtClip {
    image: string; width: number; height: number; anchor: Point;
    scale?: number; mirror?: boolean;
    frames: {rect: [number,number,number,number]; durationMs: number; anchor?: Point}[];
}
export interface HeroPose {
    body: string; position: Point; light: Point; ground: Point;
}
export interface TitleArt {
    version: 1; width: number; height: number;
    background: string; foreground: string;
    clips: Record<string,ArtClip>;
    heroes: Record<string,HeroPose>;
    lamp: {position: Point; glass: Point};
    clock: {position: Point; radius: number};
    board: {position: Point; width: number; height: number; angle: number};
    cat: Point; vines: Point[];
}

export function artFrame(clip: ArtClip,timeMs: number): number {
    const duration=clip.frames.reduce((sum,frame)=>sum+frame.durationMs,0);
    let local=Math.max(0,timeMs)%duration;
    for(let i=0;i<clip.frames.length;i++){
        if(local<clip.frames[i].durationMs)return i;
        local-=clip.frames[i].durationMs;
    }
    return 0;
}

export function validateTitleArt(value: unknown): asserts value is TitleArt {
    if(!value||typeof value!=='object')throw Error('Missing title artwork metadata');
    const art=value as TitleArt;
    if(art.version!==1||art.width!==1672||art.height!==941)throw Error('Unexpected title artwork dimensions');
    const point=(p: Point)=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
    for(const key of ['standing','sitting','leaning','lamp','cat','vines','soul']){
        const clip=art.clips?.[key];
        if(!clip?.image||!point(clip.anchor)||!clip.frames?.length)throw Error(`Missing title clip: ${key}`);
        if(clip.scale!==undefined&&(!Number.isFinite(clip.scale)||clip.scale<=0))throw Error(`Invalid title scale: ${key}`);
        if(clip.mirror!==undefined&&typeof clip.mirror!=='boolean')throw Error(`Invalid title mirror: ${key}`);
        for(const frame of clip.frames){
            const [x,y,w,h]=frame.rect;
            if(![x,y,w,h,frame.durationMs,clip.width,clip.height].every(Number.isFinite)||x<0||y<0||w<=0||h<=0||frame.durationMs<=0||x+w>clip.width||y+h>clip.height)throw Error(`Invalid title frame: ${key}`);
            if(frame.anchor&&!point(frame.anchor))throw Error(`Invalid title anchor: ${key}`);
        }
    }
    for(const pose of Object.values(art.heroes??{})){
        if(!art.clips[pose.body]||![pose.position,pose.light,pose.ground].every(point))throw Error('Invalid title pose');
    }
    if(Object.keys(art.heroes??{}).length!==3||!point(art.lamp?.position)||!point(art.lamp?.glass)||!point(art.clock?.position)||!point(art.board?.position)||!point(art.cat)||!art.vines?.every(point))throw Error('Missing title placements');
}
