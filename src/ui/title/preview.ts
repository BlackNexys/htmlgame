import {titleArtRoot} from '../MenuScene';
import {artFrame,validateTitleArt} from './TitleArt';
import {TitleArtRenderer} from './TitleArtRenderer';

const canvas=document.querySelector<HTMLCanvasElement>('#scene')!,play=document.querySelector<HTMLButtonElement>('#play')!;
const pose=document.querySelector<HTMLSelectElement>('#pose')!,time=document.querySelector<HTMLInputElement>('#time')!,status=document.querySelector<HTMLElement>('#status')!;
const step=document.querySelector<HTMLButtonElement>('#step')!,reset=document.querySelector<HTMLButtonElement>('#reset')!;
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),events=new AbortController();
let renderer: TitleArtRenderer|undefined,elapsed=0,running=!reduced.matches,last=0,paint=0,id: number|undefined;
function draw(){renderer?.draw(elapsed,pose.value);time.value=String(elapsed%10000);status.textContent=`${running?'Playing':'Still preview'} · ${(elapsed/1000).toFixed(2)} s · ${pose.selectedOptions[0].textContent}`;}
function schedule(){if(id!==undefined)cancelAnimationFrame(id);id=undefined;last=paint=0;if(running&&!document.hidden&&renderer)id=requestAnimationFrame(frame);play.textContent=running?'Pause animation':'Play animation';draw();}
function frame(now: number){if(last)elapsed+=Math.min(50,Math.max(0,now-last));last=now;if(!paint||now-paint>32){paint=now;draw();}id=requestAnimationFrame(frame);}
const options={signal:events.signal};
play.addEventListener('click',()=>{running=!running;schedule();},options);
pose.addEventListener('change',()=>{elapsed=0;draw();},options);
reset.addEventListener('click',()=>{elapsed=0;draw();},options);
step.addEventListener('click',()=>{running=false;const clip=renderer?.art.clips[pose.value==='absent'?'standing':pose.value];elapsed+=clip?clip.frames[artFrame(clip,elapsed)].durationMs:125;schedule();},options);
time.addEventListener('input',()=>{running=false;elapsed=Number(time.value);schedule();},options);
document.addEventListener('visibilitychange',schedule,options);
window.addEventListener('pagehide',()=>{if(id!==undefined)cancelAnimationFrame(id);events.abort();},{once:true});
try{
    const response=await fetch(titleArtRoot+'scene-v1.json');if(!response.ok)throw Error('Scene metadata unavailable');
    const art: unknown=await response.json();validateTitleArt(art);
    const images=new Map<string,HTMLImageElement>();
    await Promise.all(Object.entries(art.clips).map(async([key,clip])=>{const image=new Image();image.src=titleArtRoot+clip.image;await image.decode();images.set(key,image);}));
    for(const [id,file]of [['background',art.background],['foreground',art.foreground]]){const image=document.querySelector<HTMLImageElement>('#'+id)!;image.src=titleArtRoot+file;await image.decode();}
    renderer=new TitleArtRenderer(canvas,art,images);play.disabled=step.disabled=reset.disabled=false;schedule();
}catch{status.textContent='The scene could not load. Return to the main menu to use its still fallback.';}
