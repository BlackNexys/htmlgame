import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {transformWithOxc} from 'vite';
import {chromium} from '@playwright/test';
const source=await readFile(new URL('../src/game/FlickerSound.ts',import.meta.url),'utf8');
const javascript=(await transformWithOxc(source,'FlickerSound.ts')).code;
const directory=fileURLToPath(new URL('../public/assets/weapons/flicker/audio/',import.meta.url));
const browser=await chromium.launch();
try{
 const page=await browser.newPage();
 const rendered=await page.evaluate(async code=>{
  const {FlickerSound}=await import(URL.createObjectURL(new Blob([code],{type:'text/javascript'})));
  const sampleRate=44100,outputs=[];
  const context=new OfflineAudioContext(1,sampleRate*1.2,sampleRate),sound=new FlickerSound(context),starts=[];
  const pauses=[0,.2,.4,.6,.8].map(t=>context.suspend(t).then(()=>{starts.push(context.currentTime);sound.play('fire');return context.resume();}));
  const buffer=await context.startRendering();await Promise.all(pauses);
  starts.forEach((time,index)=>outputs.push({name:`fire-${index+1}`,samples:Array.from(buffer.getChannelData(0).slice(Math.round(time*sampleRate),Math.round((time+.15)*sampleRate)))}));
  for(const cue of ['hit','terrainHit','block','ectoplasm']){
   const audio=new OfflineAudioContext(1,sampleRate*.2,sampleRate),voice=new FlickerSound(audio);voice.play(cue);
   const rendered=await audio.startRendering();outputs.push({name:cue,samples:Array.from(rendered.getChannelData(0))});
  }
  return {sampleRate,outputs};
 },javascript);
 await mkdir(directory,{recursive:true});
 for(const {name,samples} of rendered.outputs){
  const output=Buffer.alloc(44+samples.length*2),rate=rendered.sampleRate;
  output.write('RIFF',0);output.writeUInt32LE(36+samples.length*2,4);output.write('WAVEfmt ',8);
  output.writeUInt32LE(16,16);output.writeUInt16LE(1,20);output.writeUInt16LE(1,22);output.writeUInt32LE(rate,24);
  output.writeUInt32LE(rate*2,28);output.writeUInt16LE(2,32);output.writeUInt16LE(16,34);output.write('data',36);output.writeUInt32LE(samples.length*2,40);
  samples.forEach((sample,i)=>output.writeInt16LE(Math.round(Math.max(-1,Math.min(1,sample))*32767),44+i*2));
  await writeFile(`${directory}/${name}.wav`,output);
  console.log(`${name}: ${samples.length/rate}s, peak ${Math.max(...samples.map(Math.abs)).toFixed(4)}`);
 }
}finally{await browser.close();}
