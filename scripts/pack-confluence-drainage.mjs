import {readFile,writeFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';
const root='public/assets/environment/confluence/v7/';
const source=(await readFile(root+'sources/drainage-source-v7.png')).toString('base64');
const browser=await chromium.launch();
try{
    const page=await browser.newPage();
    const result=await page.evaluate(async source=>{
        const im=new Image();im.src='data:image/png;base64,'+source;await im.decode();
        const src=Object.assign(document.createElement('canvas'),{width:im.width,height:im.height});
        src.getContext('2d').drawImage(im,0,0);
        const atlas=Object.assign(document.createElement('canvas'),{width:768,height:768}),ctx=atlas.getContext('2d');ctx.imageSmoothingEnabled=false;
        const frames={},names=['sluice','downpipe','outlet','basin'];
        for(let i=0;i<4;i++){
            const sx=i%2*im.width/2,sy=Math.floor(i/2)*im.height/2,w=im.width/2,h=im.height/2;
            const pixels=src.getContext('2d').getImageData(sx,sy,w,h).data;
            let l=w,t=h,r=-1,b=-1;
            for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(pixels[(y*w+x)*4+3]>=128){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
            if(r<l)throw Error('Empty drainage sprite');
            const scale=Math.min(368/(r-l+1),368/(b-t+1)),width=Math.round((r-l+1)*scale),height=Math.round((b-t+1)*scale);
            const x=i%2*384+Math.floor((384-width)/2),y=Math.floor(i/2)*384+376-height;
            ctx.drawImage(src,sx+l,sy+t,r-l+1,b-t+1,x,y,width,height);frames[names[i]]={x,y,width,height};
        }
        const pipe=frames.downpipe;
        frames.pipeShaft={x:pipe.x,y:pipe.y+40,width:pipe.width,height:pipe.height-88};
        const check=Object.assign(document.createElement('canvas'),{width:768,height:768}),cc=check.getContext('2d');cc.fillStyle='white';cc.fillRect(0,0,768,768);cc.drawImage(atlas,0,0);
        return {png:atlas.toDataURL().split(',')[1],white:check.toDataURL().split(',')[1],frames};
    },source);
    await writeFile(root+'drainage-v7.png',Buffer.from(result.png,'base64'));
    await writeFile(root+'drainage-v7.json',JSON.stringify({version:1,frames:result.frames},null,2)+'\n');
    await writeFile('artifacts/drainage-white.png',Buffer.from(result.white,'base64'));
    console.log(result.frames);
}finally{await browser.close();}
