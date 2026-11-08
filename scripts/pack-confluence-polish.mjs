import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {chromium} from '@playwright/test';
const directory='public/assets/environment/confluence/v4/';
const names=['bench','lamp','cargo','junction','ticketBooth','timetable','ledger','routeIndex','letter','shutterClosed','shutterOpen','railing'];
const sources={};for(const name of ['terrain','facades','props','water'])sources[name]=(await readFile(`${directory}sources/${name}-source-v4.png`)).toString('base64');
const browser=await chromium.launch();
try{
    const page=await browser.newPage();
    const result=await page.evaluate(async({sources,names})=>{
        const canvas=(width,height)=>Object.assign(document.createElement('canvas'),{width,height});
        const png=c=>c.toDataURL('image/png').split(',')[1];
        const load=async b=>{const im=new Image();im.src='data:image/png;base64,'+b;await im.decode();return im;};
        const output={},baselines=[],crops={};
        for(const [name,cell,cols,rows] of [['terrain',48,4,4],['facades',192,4,4],['water',256,2,1]]){
            const im=await load(sources[name]),src=canvas(im.width,im.height),s=src.getContext('2d',{willReadFrequently:true});s.drawImage(im,0,0);
            const pixels=s.getImageData(0,0,src.width,src.height).data;
            const cuts=[0];
            for(let row=1;row<rows;row++){
                const center=im.height*row/rows,radius=im.height/rows*.12,coverage=[];
                for(let y=Math.floor(center-radius);y<=center+radius;y++){
                    let n=0;for(let x=0;x<im.width;x++)if(pixels[(y*im.width+x)*4+3]>128)n++;
                    coverage.push({y,n});
                }
                const min=Math.min(...coverage.map(r=>r.n)),candidates=coverage.filter(r=>r.n<=min+im.width*.01);
                cuts.push(candidates[Math.floor(candidates.length/2)].y);
            }
            cuts.push(im.height);crops[name]={rows:cuts};
            const out=canvas(cell*cols,cell*rows),c=out.getContext('2d',{willReadFrequently:true});c.imageSmoothingEnabled=false;
            for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
                let x=Math.round(col*im.width/cols)+2,y=cuts[row]+2,w=Math.round((col+1)*im.width/cols)-x-2,h=cuts[row+1]-y-2;
                if(name==='terrain'&&col===3){
                    // Interior fill is solid material, with no transparent gutter repeated through a wall.
                    let top=0,bottom=h-1;
                    const dense=py=>{let n=0;for(let px=Math.floor(w*.2);px<w*.8;px++)if(pixels[((y+py)*im.width+x+px)*4+3]>192)n++;return n>w*.55;};
                    while(top<h-1&&!dense(top))top++;while(bottom>top&&!dense(bottom))bottom--;
                    y+=top;h=bottom-top+1;x+=4;w-=8;
                }
                c.drawImage(im,x,y,w,h,col*cell,row*cell,cell,cell);
            }
            if(name==='terrain')for(let row=0;row<4;row++)for(let col=0;col<4;col++){
                let baseline=0;
                if(col!==3){const p=c.getImageData(col*48,row*48,48,48).data;
                    for(let y=0;y<=16;y++){let n=0;for(let x=12;x<36;x++)if(p[(y*48+x)*4+3]>192)n++;if(n>=20){baseline=y;break;}}
                }
                baselines.push(baseline);
            }
            output[name]=png(out);
        }
        const im=await load(sources.props),src=canvas(im.width,im.height),s=src.getContext('2d',{willReadFrequently:true});s.drawImage(im,0,0);
        const out=canvas(768,576),c=out.getContext('2d');c.imageSmoothingEnabled=false;
        const frames={},sprites={};
        for(let i=0;i<12;i++){
            const col=i%4,row=Math.floor(i/4),x=Math.round(col*im.width/4),y=Math.round(row*im.height/3),w=Math.round((col+1)*im.width/4)-x,h=Math.round((row+1)*im.height/3)-y;
            const p=s.getImageData(x,y,w,h).data;let left=w,right=-1,top=h,bottom=-1;
            for(let py=0;py<h;py++)for(let px=0;px<w;px++)if(p[(py*w+px)*4+3]>=128){left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);}
            if(right<left)throw Error('Empty prop '+names[i]);
            if(names[i]==='lamp'){
                // Locate the lamp's connected silhouette, not the bench overhanging its cell.
                // This selects a crop; it never changes pixels inside the selected source rectangle.
                const seen=new Uint8Array(w*h);let largest=0;
                for(let start=0;start<seen.length;start++){
                    if(seen[start]||p[start*4+3]<128)continue;
                    const stack=[start];seen[start]=1;let n=0,l=w,r=-1,t=h,b=-1;
                    while(stack.length){
                        const k=stack.pop(),x=k%w,y=Math.floor(k/w);n++;l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);
                        for(const next of [x?k-1:-1,x<w-1?k+1:-1,y?k-w:-1,y<h-1?k+w:-1])if(next>=0&&!seen[next]&&p[next*4+3]>=128){seen[next]=1;stack.push(next);}
                    }
                    if(n>largest){largest=n;left=l;right=r;top=t;bottom=b;}
                }
            }
            left=Math.max(0,left-1);top=Math.max(0,top-1);right=Math.min(w-1,right+1);
            const sw=right-left+1,sh=bottom-top+1,scale=Math.min(176/sw,176/sh),dw=Math.round(sw*scale),dh=Math.round(sh*scale),dx=col*192+Math.floor((192-dw)/2),dy=row*192+184-dh;
            c.drawImage(im,x+left,y+top,sw,sh,dx,dy,dw,dh);frames[names[i]]={x:dx,y:dy,width:dw,height:dh};
            const single=canvas(sw,sh);single.getContext('2d').drawImage(im,x+left,y+top,sw,sh,0,0,sw,sh);sprites[names[i]]=png(single);
        }
        return {...output,props:png(out),frames,sprites,baselines,crops};
    },{sources,names});
    await mkdir(`${directory}sprites`,{recursive:true});
    for(const name of ['terrain','facades','props','water'])await writeFile(`${directory}${name}-v4.png`,Buffer.from(result[name],'base64'));
    await writeFile(`${directory}atlas-v4.json`,JSON.stringify({version:1,width:768,height:576,frames:result.frames},null,2)+'\n');
    await writeFile(`${directory}terrain-v4.json`,JSON.stringify({version:1,baselines:result.baselines,crops:result.crops},null,2)+'\n');
    for(const [name,b64] of Object.entries(result.sprites))await writeFile(`${directory}sprites/${name}-v4.png`,Buffer.from(b64,'base64'));
    console.log('Packed alpha-corrected sheets, grounded prop frames and water materials. Cap baselines:',result.baselines);
}finally{await browser.close();}
