import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const directory=fileURLToPath(new URL('../public/assets/mainmenu/v3/production/',import.meta.url));
const server=await createServer({server:{port:0,strictPort:false}});await server.listen();
const browser=await chromium.launch();
try{
 const page=await browser.newPage();await page.goto(server.resolvedUrls.local[0]+'docs/main-menu-art-study.html');
 const outputs=await page.evaluate(async()=>{
  const {TitleArtRenderer}=await import('/src/ui/title/TitleArtRenderer.ts');
  const {validateTitleArt}=await import('/src/ui/title/TitleArt.ts');
  const root='/assets/mainmenu/v3/production/',art=await(await fetch(root+'scene-v1.json')).json();validateTitleArt(art);
  const images=new Map();await Promise.all(Object.entries({background:art.background,foreground:art.foreground,...Object.fromEntries(Object.entries(art.clips).map(([id,clip])=>[id,clip.image]))}).map(async([id,file])=>{const image=new Image();image.src=root+file;await image.decode();images.set(id,image);}));
  const canvas=document.createElement('canvas');canvas.width=art.width;canvas.height=art.height;
  const moving=document.createElement('canvas');moving.width=art.width;moving.height=art.height;
  const renderer=new TitleArtRenderer(moving,art,images),c=canvas.getContext('2d'),outputs={};
  for(const[id,pose]of Object.entries({watcher:'standing','patient-traveller':'sitting','restless-flame':'leaning','absent-traveller':'absent'})){
   renderer.draw(0,pose);c.clearRect(0,0,art.width,art.height);c.drawImage(images.get('background'),0,0);c.drawImage(images.get('foreground'),0,0);c.drawImage(moving,0,0);
   outputs[`poster-${id}-v1.png`]=canvas.toDataURL('image/png').split(',')[1];
  }
  return outputs;
 });
 for(const[file,data]of Object.entries(outputs))await writeFile(directory+file,Buffer.from(data,'base64'));
 console.log('Exported four matching still posters from the production renderer.');
}finally{await browser.close();await server.close();}
