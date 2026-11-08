import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';

// Formatting only: crop authored cells, trim alpha bounds, and nearest-neighbor pack.
// Generated source artwork remains unchanged under sources/.
const version=process.argv[2]??'v1';
if(!/^v[1-9]\d*$/.test(version))throw Error('Expected an asset version such as v3');
const directory=fileURLToPath(new URL(`../public/assets/environment/confluence/${version}/`,import.meta.url));
const names=['bench','lamp','cargo','junction','ticketBooth','timetable','ledger','routeIndex','letter','shutterClosed','shutterOpen','railing'];
const landmarkNames=['roseWindow','freightGantry','viaductArch','mineralArc','stationClock','tenementWindows'];
const sources={};
for(const name of ['terrain','facades','props','landmarks'])sources[name]=(await readFile(`${directory}sources/${name}-source-${version}.png`)).toString('base64');
const browser=await chromium.launch();
try{
    const page=await browser.newPage();
    const packed=await page.evaluate(async({sources,names,landmarkNames})=>{
        const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
        const png=c=>c.toDataURL('image/png').split(',')[1];
        const load=async b64=>{const im=new Image();im.src=`data:image/png;base64,${b64}`;await im.decode();return im;};
        const result={};
        for(const [name,cell,columns,rows] of [['terrain',48,4,4],['facades',192,4,4],['landmarks',256,3,2]]){
            const im=await load(sources[name]),out=canvas(cell*columns,cell*rows),c=out.getContext('2d');c.imageSmoothingEnabled=false;
            for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
                const x=Math.round(col*im.width/columns)+2,y=Math.round(row*im.height/rows)+2;
                const w=Math.round((col+1)*im.width/columns)-x-2,h=Math.round((row+1)*im.height/rows)-y-2;
                c.drawImage(im,x,y,w,h,col*cell,row*cell,cell,cell);
            }
            result[name]=png(out);
            if(name==='landmarks'){
                result.landmarkSprites={};
                for(let i=0;i<6;i++){const single=canvas(cell,cell);single.getContext('2d').drawImage(out,i%columns*cell,Math.floor(i/columns)*cell,cell,cell,0,0,cell,cell);result.landmarkSprites[landmarkNames[i]]=png(single);}
            }
        }
        const im=await load(sources.props),src=canvas(im.width,im.height),s=src.getContext('2d',{willReadFrequently:true});s.drawImage(im,0,0);
        const out=canvas(768,576),c=out.getContext('2d');c.imageSmoothingEnabled=false;
        const frames={},sprites={},bounds={};
        for(let i=0;i<12;i++){
            const col=i%4,row=Math.floor(i/4),x=Math.round(col*im.width/4),y=Math.round(row*im.height/3);
            const width=Math.round((col+1)*im.width/4)-x,height=Math.round((row+1)*im.height/3)-y;
            const data=s.getImageData(x,y,width,height).data;
            let left=width,top=height,right=-1,bottom=-1;
            for(let py=0;py<height;py++)for(let px=0;px<width;px++)if(data[(py*width+px)*4+3]>=128){left=Math.min(left,px);top=Math.min(top,py);right=Math.max(right,px);bottom=Math.max(bottom,py);}
            if(right<left)throw Error(`Empty sprite ${names[i]}`);
            left=Math.max(0,left-6);top=Math.max(0,top-6);right=Math.min(width-1,right+6);bottom=Math.min(height-1,bottom+6);
            const sw=right-left+1,sh=bottom-top+1,scale=Math.min(176/sw,176/sh),dw=Math.max(1,Math.round(sw*scale)),dh=Math.max(1,Math.round(sh*scale));
            const dx=col*192+Math.floor((192-dw)/2),dy=row*192+184-dh;
            c.drawImage(im,x+left,y+top,sw,sh,dx,dy,dw,dh);
            frames[names[i]]={x:dx,y:dy,width:dw,height:dh};bounds[names[i]]={x:x+left,y:y+top,width:sw,height:sh};
            const single=canvas(sw,sh);single.getContext('2d').drawImage(im,x+left,y+top,sw,sh,0,0,sw,sh);sprites[names[i]]=png(single);
        }
        return {...result,props:png(out),frames,sprites,source:{width:im.width,height:im.height,bounds}};
    },{sources,names,landmarkNames});
    await mkdir(`${directory}sprites`,{recursive:true});
    for(const name of ['terrain','facades','props','landmarks'])await writeFile(`${directory}${name}-${version}.png`,Buffer.from(packed[name],'base64'));
    for(const [name,b64] of Object.entries(packed.sprites))await writeFile(`${directory}sprites/${name}-${version}.png`,Buffer.from(b64,'base64'));
    for(const [name,b64] of Object.entries(packed.landmarkSprites))await writeFile(`${directory}sprites/${name}-${version}.png`,Buffer.from(b64,'base64'));
    await copyFile(`${directory}sources/city-source-${version}.png`,`${directory}city-${version}.png`);
    await writeFile(`${directory}atlas-${version}.json`,JSON.stringify({version:1,width:768,height:576,frames:packed.frames,source:packed.source},null,2)+'\n');
    console.log('Packed 16 terrain tiles, 16 facade panels, 12 alpha props and 6 landmarks; preserved all five generated sources.');
}finally{await browser.close();}
