import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
const server=await createServer({server:{port:0,strictPort:false}});await server.listen();const browser=await chromium.launch();
try{
 const page=await browser.newPage();await page.goto(server.resolvedUrls.local[0]+'docs/confluence-menu-study.html');
 const outputs=await page.evaluate(async()=>{
  const {loadConfluenceArt}=await import('/src/ui/title/ConfluenceArt.ts'),{ConfluenceRenderer}=await import('/src/ui/title/ConfluenceRenderer.ts');
  const {art,images}=await loadConfluenceArt('/assets/mainmenu/confluence-v1/'),canvas=document.createElement('canvas');canvas.width=art.width;canvas.height=art.height;const renderer=new ConfluenceRenderer(canvas,art,images),outputs={};
  for(const time of [0,175,700,1400,24000]){renderer.draw(time,'confluence',0);outputs[time]=canvas.toDataURL('image/png').split(',')[1];}
  return{outputs,poster:art.poster,bytes:renderer.estimatedBytes};
 });
 await mkdir('artifacts',{recursive:true});
 for(const[time,data]of Object.entries(outputs.outputs))await writeFile(time==='0'?'public/assets/mainmenu/confluence-v1/'+outputs.poster:`artifacts/confluence-menu-${time}.png`,Buffer.from(data,'base64'));
 console.log('Rendered matching poster and scene proofs; estimated image/cache memory '+(outputs.bytes/1048576).toFixed(1)+' MiB.');
}finally{await browser.close();await server.close();}
