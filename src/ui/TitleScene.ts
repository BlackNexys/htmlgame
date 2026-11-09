import {selectMenuScene,titleArtRoot,confluenceArtRoot,menuScenes,type MenuScene} from './MenuScene';
import type {MenuMotion} from './GamePreferences';
import {validateTitleArt,type TitleArt} from './title/TitleArt';
import {TitleArtRenderer} from './title/TitleArtRenderer';
import {loadConfluenceArt} from './title/ConfluenceArt';
import {ConfluenceRenderer} from './title/ConfluenceRenderer';

const previousKey='underworld-menu-scene:v1';

/** Production title presentation owns one cosmetic clock, separate from the game. */
export class TitleScene {
    private readonly reduced=matchMedia('(prefers-reduced-motion: reduce)');
    private readonly events=new AbortController();
    private readonly canvas: HTMLCanvasElement;
    private readonly poster: HTMLImageElement;
    private readonly background: HTMLImageElement;
    private readonly foreground: HTMLImageElement;
    private readonly motionPrompt=document.querySelector<HTMLButtonElement>('#title-enable-motion')!;
    private readonly legacy=menuScenes.some(scene=>scene.id===new URLSearchParams(location.search).get('menuScene'));
    private renderer?: TitleArtRenderer|ConfluenceRenderer;
    private seed=0;
    private scene?: MenuScene;
    private previous?: string;
    private active=false;
    private motion: MenuMotion='system';
    private disposed=false;
    private failed=false;
    private running=false;
    private frameId?: number;
    private last=0;
    private lastPaint=0;
    private elapsed=0;

    constructor(private readonly root: HTMLElement){
        this.canvas=root.querySelector<HTMLCanvasElement>('.menu-scene-motion')!;
        this.poster=root.querySelector<HTMLImageElement>('.menu-poster')!;
        this.background=root.querySelector<HTMLImageElement>('.title-background')!;
        this.foreground=root.querySelector<HTMLImageElement>('.menu-platform')!;
        this.root.dataset.composition=this.legacy?'station-v3':'confluence';
        try{this.previous=sessionStorage.getItem(previousKey)||undefined;}catch{/* Optional session selection. */}
        const options={signal:this.events.signal};
        this.reduced.addEventListener('change',this.sync,options);
        document.addEventListener('visibilitychange',this.sync,options);
        void this.load();
    }
    show(){if(this.disposed)return;if(!this.active)this.select();this.active=true;this.sync();}
    hide(){this.active=false;this.sync();}
    preferences(motion: MenuMotion){this.motion=motion;this.sync();}
    dispose(){this.hide();this.disposed=true;this.events.abort();this.renderer=undefined;}

    private select(){
        if(!this.legacy){
            this.seed=Math.floor(Math.random()*0x7fffffff);this.elapsed=0;
            this.root.dataset.scene='confluence';this.root.dataset.hero='true';
            this.poster.src=confluenceArtRoot+'poster-v2.png';this.draw();return;
        }
        this.scene=selectMenuScene(this.previous,Math.random,new URLSearchParams(location.search).get('menuScene'));
        this.previous=this.scene.id;this.elapsed=0;
        try{sessionStorage.setItem(previousKey,this.scene.id);}catch{/* Storage is not required. */}
        this.root.dataset.scene=this.scene.id;
        this.poster.src=this.scene.poster;
        this.root.dataset.hero=String(!!this.scene.pose);
        this.draw();
    }
    private async load(){
        try{
            if(!this.legacy){
                const {art,images}=await loadConfluenceArt(confluenceArtRoot,this.events.signal);
                if(this.disposed)return;
                this.renderer=new ConfluenceRenderer(this.canvas,art,images);
                this.draw();this.root.dataset.renderer='ready';this.sync();return;
            }
            const response=await fetch(titleArtRoot+'scene-v1.json',{signal:this.events.signal});
            if(!response.ok)throw Error('Title metadata unavailable');
            const value: unknown=await response.json();validateTitleArt(value);const art: TitleArt=value;
            const images=new Map<string,HTMLImageElement>();
            const read=async(id: string,file: string)=>{
                const image=new Image();image.src=titleArtRoot+file;await image.decode();images.set(id,image);
            };
            await Promise.all([read('background',art.background),read('foreground',art.foreground),...Object.entries(art.clips).map(([id,clip])=>read(id,clip.image))]);
            if(this.disposed)return;
            for(const[id,clip]of Object.entries(art.clips)){
                const image=images.get(id)!;if(image.naturalWidth!==clip.width||image.naturalHeight!==clip.height)throw Error(`Title image dimensions differ: ${id}`);
            }
            for(const id of ['background','foreground']){
                const image=images.get(id)!;if(image.naturalWidth!==art.width||image.naturalHeight!==art.height)throw Error('Title layers do not share a frame');
            }
            this.renderer=new TitleArtRenderer(this.canvas,art,images);
            this.background.src=images.get('background')!.src;this.foreground.src=images.get('foreground')!.src;
            await Promise.all([this.background.decode(),this.foreground.decode()]);
            if(this.disposed)return;
            this.draw();this.root.dataset.renderer='ready';this.sync();
        }catch{
            if(this.disposed)return;
            this.failed=true;this.root.dataset.renderer='fallback';this.sync();
        }
    }
    private readonly sync=()=>{
        if(this.disposed)return;
        const playing=this.active&&!document.hidden;
        const animate=playing&&(this.motion==='animated'||this.motion==='system'&&!this.reduced.matches);
        this.root.dataset.playing=String(playing);this.root.dataset.motion=animate?'animated':'still';
        this.motionPrompt.hidden=!(playing&&this.motion==='system'&&this.reduced.matches);
        const run=animate&&!!this.renderer&&!this.failed;
        if(run===this.running){if(!animate&&playing)this.draw(0);return;}
        this.running=run;this.last=0;this.lastPaint=0;
        if(this.frameId!==undefined)cancelAnimationFrame(this.frameId);this.frameId=undefined;
        if(run){this.draw();this.frameId=requestAnimationFrame(this.frame);}
        else if(playing)this.draw(0);
    };
    private readonly frame=(time: number)=>{
        if(!this.running||this.disposed)return;
        if(this.last)this.elapsed+=Math.min(50,Math.max(0,time-this.last));this.last=time;
        // Authored clips run at their own rates; rigid motion needs only 30 paints/s.
        if(!this.lastPaint||time-this.lastPaint>=1000/30-1){this.lastPaint=time;this.draw();}
        if(this.running)this.frameId=requestAnimationFrame(this.frame);
    };
    private draw(time=this.elapsed){
        if(!this.renderer||this.legacy&&!this.scene||this.failed)return;
        try{
            if(this.renderer instanceof ConfluenceRenderer)this.renderer.draw(time,'confluence',this.seed);
            else this.renderer.draw(time,this.scene?.pose??'absent');
        }
        catch{this.failed=true;this.root.dataset.renderer='fallback';this.running=false;if(this.frameId!==undefined)cancelAnimationFrame(this.frameId);this.frameId=undefined;}
    }
}
