import {frameAt,validateManifest,type PilotManifest} from './Manifest';
import {PilotRenderer} from './Renderer';

const assetsRoot='./assets/mainmenu/v2/';
const canvas=document.querySelector<HTMLCanvasElement>('#pilot')!;
const status=document.querySelector<HTMLElement>('#status')!;
const motion=document.querySelector<HTMLSelectElement>('#motion')!;
const scale=document.querySelector<HTMLSelectElement>('#scale')!;
const note=document.querySelector<HTMLElement>('#motion-note')!;
const play=document.querySelector<HTMLButtonElement>('#play')!;
const reset=document.querySelector<HTMLButtonElement>('#reset')!;
const step=document.querySelector<HTMLButtonElement>('#step')!;
const anchors=document.querySelector<HTMLInputElement>('#anchors')!;
const lighting=document.querySelector<HTMLInputElement>('#lighting')!;
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),events=new AbortController();
const preferenceKey='underworld-menu-pilot-motion:v1';
let renderer: PilotRenderer|undefined,manifest: PilotManifest,elapsed=0,last=0,frameId:number|undefined,running=false;
const cards:{canvas:HTMLCanvasElement;caption:HTMLElement;id:string}[]=[];
try{const saved=localStorage.getItem(preferenceKey);if(saved&&['system','animated','still'].includes(saved))motion.value=saved;}catch{/* Optional preference. */}

async function image(file:string){
    const image=new Image();image.src=assetsRoot+file;await image.decode();return image;
}
function draw(){
    if(!renderer)return;
    renderer.draw(elapsed,{anchors:anchors.checked,lighting:lighting.checked});
    for(const card of cards){
        const clip=Object.values(manifest.assets).find(clip=>clip.id===card.id)!;
        const c=card.canvas.getContext('2d')!,index=frameAt(clip,elapsed),rect=clip.frames[index].rect;
        c.imageSmoothingEnabled=false;c.clearRect(0,0,card.canvas.width,card.canvas.height);
        c.drawImage(renderer.images.get(card.id)!,...rect,0,0,rect[2],rect[3]);
        card.caption.textContent=`${clip.cell.width} × ${clip.cell.height} · frame ${index+1} / ${clip.frames.length}`;
    }
}
function frame(time:number){
    if(!running)return;
    if(last)elapsed+=Math.min(50,Math.max(0,time-last));last=time;draw();frameId=requestAnimationFrame(frame);
}
function sync(){
    const allowed=motion.value==='animated'||(motion.value==='system'&&!reduced.matches);
    const next=!!renderer&&allowed&&!document.hidden;
    if(next!==running){
        running=next;last=0;
        if(frameId!==undefined)cancelAnimationFrame(frameId);frameId=undefined;
        if(running)frameId=requestAnimationFrame(frame);
    }
    play.textContent=allowed?'Pause animation':'Play animation';
    note.textContent=motion.value==='system'&&reduced.matches
        ?'Your system has reduced motion enabled. Select On or Play animation to see the authored loops.'
        :motion.value==='still'?'Still mode. Step one frame to inspect the drawings.':'Authored frames play independently; On overrides system reduced motion.';
    if(renderer)status.textContent=running?'Playing · animation study':'Still preview · animation study';
    draw();
}
function choose(value:string){motion.value=value;try{localStorage.setItem(preferenceKey,value);}catch{/* Optional preference. */}sync();}
play.addEventListener('click',()=>choose(running?'still':'animated'),{signal:events.signal});
motion.addEventListener('change',()=>choose(motion.value),{signal:events.signal});
scale.addEventListener('change',()=>{canvas.style.width=scale.value==='fit'?'100%':`${640*Number(scale.value)}px`;},{signal:events.signal});
reset.addEventListener('click',()=>{elapsed=0;last=0;draw();},{signal:events.signal});
step.addEventListener('click',()=>{choose('still');elapsed+=1000/12;draw();},{signal:events.signal});
anchors.addEventListener('change',draw,{signal:events.signal});lighting.addEventListener('change',draw,{signal:events.signal});
reduced.addEventListener('change',sync,{signal:events.signal});document.addEventListener('visibilitychange',sync,{signal:events.signal});
window.addEventListener('pagehide',()=>{running=false;if(frameId!==undefined)cancelAnimationFrame(frameId);events.abort();},{once:true});
sync();

async function start(){
    try{
        const response=await fetch(assetsRoot+'pilot-v1.json');if(!response.ok)throw Error('Pilot metadata could not load.');
        const data:unknown=await response.json();validateManifest(data);manifest=data;
        const entries=await Promise.all(Object.values(manifest.assets).map(async clip=>{
            const asset=await image(clip.image);
            if(asset.naturalWidth!==clip.width||asset.naturalHeight!==clip.height)throw Error(`Unexpected dimensions for ${clip.name}`);
            return [clip.id,asset] as const;
        }));
        renderer=new PilotRenderer(canvas,manifest,new Map(entries),await image('lamp-emission-v1.png'));
        for(const color of manifest.palette.colors){const swatch=document.createElement('div');swatch.className='swatch';swatch.style.background=color;swatch.title=color;swatch.setAttribute('aria-label',color);document.querySelector('#palette')!.append(swatch);}
        for(const clip of Object.values(manifest.assets)){
            const article=document.createElement('article'),heading=document.createElement('h3'),sample=document.createElement('canvas'),caption=document.createElement('p');
            heading.textContent=clip.name;sample.width=clip.cell.width;sample.height=clip.cell.height;
            sample.setAttribute('aria-label',clip.name);article.append(heading,sample,caption);document.querySelector('#assets')!.append(article);
            cards.push({canvas:sample,caption,id:clip.id});
        }
        play.disabled=reset.disabled=step.disabled=false;sync();
    }catch(error){status.textContent=`The pilot could not load: ${error instanceof Error?error.message:'Unknown error'}. The reference study remains below.`;}
}
void start();
