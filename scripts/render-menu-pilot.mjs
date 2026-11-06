import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const directory=fileURLToPath(new URL('../public/assets/mainmenu/v2/',import.meta.url));
const server=await createServer({server:{port:0,strictPort:false}});await server.listen();
const browser=await chromium.launch();
try{
 const page=await browser.newPage({reducedMotion:'reduce'});
 await page.goto(`${server.resolvedUrls.local[0]}menu-pilot.html`);
 await page.getByRole('button',{name:'Play animation',exact:true}).waitFor({state:'visible'});
 await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Still preview'));
 const images=await page.evaluate(async()=>{
  const root='/assets/mainmenu/v2/',manifest=await(await fetch(root+'pilot-v1.json')).json(),outputs={};
  outputs['pilot-poster-v1.png']=document.querySelector('#pilot').toDataURL('image/png').split(',')[1];
  for(const id of ['body','flame','cape']){
   const clip=manifest.assets[id],image=new Image();image.src=root+clip.image;await image.decode();
   const columns=id==='body'?3:4,canvas=document.createElement('canvas');
   canvas.width=columns*clip.cell.width;canvas.height=Math.ceil(clip.frames.length/columns)*clip.cell.height;
   const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
   c.fillStyle='#121726';c.fillRect(0,0,canvas.width,canvas.height);
   clip.frames.forEach((frame,index)=>{
    const x=index%columns*clip.cell.width,y=Math.floor(index/columns)*clip.cell.height;
    c.drawImage(image,...frame.rect,x,y,clip.cell.width,clip.cell.height);
    c.strokeStyle='#30334a';c.strokeRect(x+.5,y+.5,clip.cell.width-1,clip.cell.height-1);
    c.fillStyle='#a9a8ba';c.font='8px monospace';c.fillText(String(index+1),x+4,y+10);
   });
   outputs[`review/${id}-contact-v1.png`]=canvas.toDataURL('image/png').split(',')[1];
  }
  return outputs;
 });
 await mkdir(`${directory}/review`,{recursive:true});
 for(const[name,data]of Object.entries(images))await writeFile(`${directory}/${name}`,Buffer.from(data,'base64'));
 console.log('Rendered the 640x360 still poster and native-size body, flame and cape contact sheets.');
}finally{await browser.close();await server.close();}
