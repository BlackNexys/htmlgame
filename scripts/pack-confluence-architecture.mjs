import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';

// Crop and pack the authored cells; preserve the generated source and its alpha.
const version=process.argv[2]??'v2';
if(!/^v[1-9]\d*$/.test(version))throw Error('Expected an asset version such as v3');
const directory=fileURLToPath(new URL(`../public/assets/environment/confluence/${version}/`,import.meta.url));
const names=['stationEntrance','inhabitedBalcony','stationCanopy','retainingPier','bridgeDeck','bridgeArch','freightCage','maintenanceStairs','registryShelves','registryCounter','registryGallery','archiveMachinery'];
const source=(await readFile(`${directory}sources/architecture-source-${version}.png`)).toString('base64');
const browser=await chromium.launch();
try{
    const page=await browser.newPage();
    const packed=await page.evaluate(async({source,names})=>{
        const image=new Image();image.src=`data:image/png;base64,${source}`;await image.decode();
        const canvas=(width,height)=>Object.assign(document.createElement('canvas'),{width,height});
        const png=c=>c.toDataURL('image/png').split(',')[1];
        const src=canvas(image.width,image.height),s=src.getContext('2d',{willReadFrequently:true});s.drawImage(image,0,0);
        const out=canvas(1024,768),c=out.getContext('2d');c.imageSmoothingEnabled=false;
        const frames={},sprites={};
        for(let i=0;i<12;i++){
            const col=i%4,row=Math.floor(i/4),x=Math.round(col*image.width/4),y=Math.round(row*image.height/3);
            const width=Math.round((col+1)*image.width/4)-x,height=Math.round((row+1)*image.height/3)-y;
            const data=s.getImageData(x,y,width,height).data;
            let left=width,top=height,right=-1,bottom=-1;
            for(let py=0;py<height;py++)for(let px=0;px<width;px++)if(data[(py*width+px)*4+3]>=128){left=Math.min(left,px);top=Math.min(top,py);right=Math.max(right,px);bottom=Math.max(bottom,py);}
            if(right<left)throw Error(`Empty architecture ${names[i]}`);
            left=Math.max(0,left-2);top=Math.max(0,top-2);right=Math.min(width-1,right+2);bottom=Math.min(height-1,bottom+2);
            const sw=right-left+1,sh=bottom-top+1,scale=Math.min(248/sw,248/sh),dw=Math.round(sw*scale),dh=Math.round(sh*scale);
            const dx=col*256+Math.floor((256-dw)/2),dy=row*256+252-dh;
            c.drawImage(image,x+left,y+top,sw,sh,dx,dy,dw,dh);frames[names[i]]={x:dx,y:dy,width:dw,height:dh};
            const single=canvas(sw,sh);single.getContext('2d').drawImage(image,x+left,y+top,sw,sh,0,0,sw,sh);sprites[names[i]]=png(single);
        }
        return {atlas:png(out),frames,sprites};
    },{source,names});
    await mkdir(`${directory}sprites`,{recursive:true});
    await writeFile(`${directory}architecture-${version}.png`,Buffer.from(packed.atlas,'base64'));
    const manifest=version==='v2'?'atlas-v2.json':`architecture-atlas-${version}.json`;
    await writeFile(`${directory}${manifest}`,JSON.stringify({version:1,width:1024,height:768,frames:packed.frames},null,2)+'\n');
    for(const [name,data] of Object.entries(packed.sprites))await writeFile(`${directory}sprites/${name}-${version}.png`,Buffer.from(data,'base64'));
    console.log('Packed twelve architectural modules; source and transparency preserved.');
}finally{await browser.close();}
