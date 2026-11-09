import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';
const base=process.argv[2]??'http://127.0.0.1:3012';
const browser=await chromium.launch();
try{
    const page=await browser.newPage();await page.goto(base);
    const result=await page.evaluate(async()=>{
        const {ConfluenceWaterRenderer}=await import('/src/environment/ConfluenceWaterRenderer.ts');
        const image=new Image();image.src='/assets/environment/confluence/v4/water-v4.png';await image.decode();
        const canvas=Object.assign(document.createElement('canvas'),{width:320,height:448}),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
        const renderer=new ConfluenceWaterRenderer(ctx,image,{waterfalls:[{x:96,y:32,width:128,height:416}],river:{x:0,y:1000,width:320,height:100}});
        const camera={x:0,y:0,width:320,height:448,canSee:r=>r.y<448&&r.y+r.height>0};
        const frames=[];
        const strip=Object.assign(document.createElement('canvas'),{width:1280,height:448});
        for(const [i,time] of [0,.25,.5,.75,.75].entries()){
            ctx.clearRect(0,0,320,448);renderer.draw(camera,time);frames.push(ctx.getImageData(0,0,320,448).data);
            if(i<4){strip.getContext('2d').fillStyle='#081722';strip.getContext('2d').fillRect(i*320,0,320,448);strip.getContext('2d').drawImage(canvas,i*320,0);}
        }
        const difference=dy=>{
            let sum=0,count=0;
            for(let y=90;y<300;y++)for(let x=110;x<210;x++)for(let channel=0;channel<4;channel++){
                sum+=Math.abs(frames[0][(y*320+x)*4+channel]-frames[1][((y+dy)*320+x)*4+channel]);count++;
            }
            return sum/count;
        };
        const down=difference(10),up=difference(-10),frozen=frames[3].every((v,i)=>v===frames[4][i]);
        return {down,up,frozen,png:strip.toDataURL().split(',')[1]};
    });
    if(!(result.down<result.up*.1)||!result.frozen)throw Error(`Water motion regression: ${JSON.stringify({down:result.down,up:result.up,frozen:result.frozen})}`);
    await mkdir('artifacts',{recursive:true});await writeFile('artifacts/water-motion.png',Buffer.from(result.png,'base64'));
    console.log(JSON.stringify({downwardPixelError:result.down,upwardPixelError:result.up,frozenTimeIdentical:result.frozen}));
}finally{await browser.close();}
