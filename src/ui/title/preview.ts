import {confluenceArtRoot} from '../MenuScene';
import {artFrame} from './TitleArt';
import {loadConfluenceArt,trainPhase} from './ConfluenceArt';
import {ConfluenceRenderer} from './ConfluenceRenderer';

if(new URLSearchParams(location.search).has('legacy')){
    for(const id of ['background','foreground','legacy-pose'])document.getElementById(id)!.hidden=false;
    document.getElementById('inspection')!.hidden=true;document.getElementById('train')!.hidden=true;
    await import('./legacyPreview');
}else{
    const canvas=document.querySelector<HTMLCanvasElement>('#scene')!,play=document.querySelector<HTMLButtonElement>('#play')!;
    const time=document.querySelector<HTMLInputElement>('#time')!,status=document.querySelector<HTMLElement>('#status')!;
    const step=document.querySelector<HTMLButtonElement>('#step')!,reset=document.querySelector<HTMLButtonElement>('#reset')!,trainButton=document.querySelector<HTMLButtonElement>('#train')!;
    const selected=document.querySelector<HTMLSelectElement>('#layer')!,solo=document.querySelector<HTMLInputElement>('#solo')!,hide=document.querySelector<HTMLInputElement>('#hide')!,guides=document.querySelector<HTMLInputElement>('#guides')!;
    const hidden=new Set<string>(),events=new AbortController(),options={signal:events.signal};
    let renderer:ConfluenceRenderer|undefined,elapsed=0,running=!matchMedia('(prefers-reduced-motion: reduce)').matches,last=0,paint=0,frameId:number|undefined;
    function draw(){
        renderer?.draw(elapsed,'confluence',0,{hidden,solo:solo.checked?selected.value:undefined,guides:guides.checked});
        time.value=String(Math.min(90000,elapsed));status.textContent=`${running?'Playing':'Still preview'} · ${(elapsed/1000).toFixed(2)} s · Seated Cole · ${canvas.dataset.artMib??'…'} MiB art/cache`;
    }
    function schedule(){if(frameId!==undefined)cancelAnimationFrame(frameId);frameId=undefined;last=paint=0;play.textContent=running?'Pause animation':'Play animation';draw();if(running&&!document.hidden&&renderer)frameId=requestAnimationFrame(frame);}
    function frame(now:number){if(last)elapsed+=Math.min(50,Math.max(0,now-last));last=now;if(!paint||now-paint>=1000/30-1){paint=now;draw();}if(running&&!document.hidden)frameId=requestAnimationFrame(frame);}
    play.addEventListener('click',()=>{running=!running;schedule();},options);
    reset.addEventListener('click',()=>{elapsed=0;draw();},options);
    step.addEventListener('click',()=>{
        running=false;const layer=renderer?.art.layers.find(l=>l.id===selected.value),clip=layer&&'clip'in layer?renderer?.art.clips[layer.clip]:renderer?.art.clips.cole;
        elapsed+=clip?.frames[artFrame(clip,elapsed)].durationMs??175;schedule();
    },options);
    trainButton.addEventListener('click',()=>{
        const track=renderer?.art.layers.find(l=>l.kind==='train');if(track?.kind!=='train')return;
        let next=elapsed+100;for(let i=0;i<1200;i++,next+=100){const phase=trainPhase(track,next,0);if(phase!==undefined&&phase>=.4&&phase<=.6)break;}
        elapsed=next;running=false;schedule();
    },options);
    time.addEventListener('input',()=>{elapsed=Number(time.value);running=false;schedule();},options);
    selected.addEventListener('change',()=>{hide.checked=hidden.has(selected.value);draw();},options);
    hide.addEventListener('change',()=>{hide.checked?hidden.add(selected.value):hidden.delete(selected.value);draw();},options);
    solo.addEventListener('change',draw,options);guides.addEventListener('change',draw,options);
    document.addEventListener('visibilitychange',schedule,options);
    window.addEventListener('pagehide',()=>{if(frameId!==undefined)cancelAnimationFrame(frameId);events.abort();},{once:true});
    try{
        const {art,images}=await loadConfluenceArt(confluenceArtRoot,events.signal);renderer=new ConfluenceRenderer(canvas,art,images);
        for(const layer of art.layers){const option=document.createElement('option');option.value=layer.id;option.textContent=layer.id.replaceAll('-',' ');selected.append(option);}selected.value='cole';selected.disabled=false;
        const track=art.layers.find(l=>l.kind==='train');if(track?.kind==='train'){
            for(const t of [0,track.firstMs,track.firstMs+track.durationMs,90000]){const option=document.createElement('option');option.value=String(t);option.label=(t/1000)+' s';document.getElementById('event-markers')!.append(option);}
            document.getElementById('events')!.textContent=`Train starts at ${track.firstMs/1000} s · 90 s scrub range`;
        }
        play.disabled=step.disabled=reset.disabled=trainButton.disabled=false;schedule();
    }catch{status.textContent='The scene could not load. Return to the main menu to use its still fallback.';}
}
