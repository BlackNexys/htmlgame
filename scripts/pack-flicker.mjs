import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';

// Deterministic sprite packing, scale and direction baking. The generated source is preserved.
const directory = fileURLToPath(new URL('../public/assets/weapons/flicker/', import.meta.url));
const source = await readFile(`${directory}/flicker-source-v1.png`);
const browser = await chromium.launch();
try {
    const page = await browser.newPage();
    const packed = await page.evaluate(async encoded => {
        const image = new Image(); image.src = `data:image/png;base64,${encoded}`; await image.decode();
        const cell = image.width / 6;
        const original = document.createElement('canvas'); original.width = image.width; original.height = image.height;
        const originalContext = original.getContext('2d', {willReadFrequently:true}); originalContext.drawImage(image,0,0);
        const anchors = [], lengths = [];
        for (let row=0;row<6;row++) {
            const rowAnchors=[];
            for(let column=0;column<6;column++) {
                const left=Math.round(column*cell),top=Math.round(row*cell),size=Math.floor(cell);
                const pixels=originalContext.getImageData(left,top,size,size).data;
                let weight=0,cx=0,cy=0,min=size,max=0;
                for(let y=0;y<size;y++)for(let x=0;x<size;x++) {
                    const i=(y*size+x)*4,alpha=pixels[i+3];
                    if(alpha>128){min=Math.min(min,x);max=Math.max(max,x);}
                    if(alpha>100 && pixels[i]>225 && pixels[i+1]>175 && pixels[i+2]>210) {
                        const bright=alpha*(pixels[i+1]-170); weight+=bright;cx+=x*bright;cy+=y*bright;
                    }
                }
                rowAnchors.push(weight?[cx/weight,cy/weight]:[cell/2,cell/2]);
                if(row===0)lengths.push(max-min+1);
            }
            anchors.push(rowAnchors);
        }
        const scale=Math.min(32/cell,18/Math.max(...lengths));
        const atlas=document.createElement('canvas');atlas.width=192;atlas.height=416;
        const c=atlas.getContext('2d');c.imageSmoothingEnabled=false;
        for(let row=0;row<13;row++)for(let column=0;column<6;column++) {
            const sourceRow=row<8?0:row-7;
            const [anchorX,anchorY]=anchors[sourceRow][column];
            c.save();c.beginPath();c.rect(column*32,row*32,32,32);c.clip();
            c.translate(column*32+16,row*32+16);
            if(row<8)c.rotate(row*Math.PI/4);
            // Keep the flight core steady. Impact flecks retain their source-cell center.
            const x=sourceRow===0?anchorX:cell/2,y=sourceRow===0?anchorY:cell/2;
            c.drawImage(image,column*cell,sourceRow*cell,cell,cell,-x*scale,-y*scale,cell*scale,cell*scale);
            c.restore();
        }
        return {png:atlas.toDataURL('image/png').split(',')[1],sourceSize:image.width,anchors,scale};
    }, source.toString('base64'));
    await mkdir(directory,{recursive:true});
    await writeFile(`${directory}/flicker-v1.png`,Buffer.from(packed.png,'base64'));
    const metadata={version:1,image:'flicker-v1.png',width:192,height:416,cell:{width:32,height:32},columns:6,
        flight:{rows:['right','down-right','down','down-left','left','up-left','up','up-right'],frames:6,frameDuration:.05,loop:true,anchor:{x:16,y:16}},
        effects:{ignition:{row:8,frames:6,frameDuration:.018},enemy:{row:9,frames:6,frameDuration:.028},terrain:{row:10,frames:6,frameDuration:.02},blocked:{row:11,frames:6,frameDuration:.022},ember:{row:12,frames:6,frameDuration:.03}},
        source:{image:'flicker-source-v1.png',size:packed.sourceSize,columns:6,rows:6,scale:packed.scale,anchors:packed.anchors}};
    await writeFile(`${directory}/flicker_atlas.json`,JSON.stringify(metadata,null,2)+'\n');
    console.log(`Packed 192x416 RGBA atlas: eight directions and five effect rows (source ${packed.sourceSize}px).`);
} finally {await browser.close();}
