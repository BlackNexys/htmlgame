import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {chromium} from '@playwright/test';
const root='public/assets/environment/confluence/',out=root+'v6/';
const files={canopy:'v6/sources/canopy-source-v6.png',insets:'v6/sources/insets-source-v6.png',architecture:'v3/architecture-v3.png',landmarks:'v3/landmarks-v3.png'};
const sources={};for(const [key,file] of Object.entries(files))sources[key]=(await readFile(root+file)).toString('base64');
const old=JSON.parse(await readFile(root+'v3/architecture-atlas-v3.json','utf8'));
const names=['registrySignal','freightGantry','wiredArch','spectralRib','stationClock','inhabitedFrontage'];
const browser=await chromium.launch();
try{
    const page=await browser.newPage();
    const result=await page.evaluate(async({sources,old,names})=>{
        const canvas=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
        const png=c=>c.toDataURL('image/png').split(',')[1];
        const load=async b=>{const im=new Image();im.src='data:image/png;base64,'+b;await im.decode();const c=canvas(im.width,im.height);c.getContext('2d').drawImage(im,0,0);return c;};
        const crop=(c,x=0,y=0,w=c.width,h=c.height)=>{
            const p=c.getContext('2d').getImageData(x,y,w,h).data;let l=w,t=h,r=-1,b=-1;
            for(let py=0;py<h;py++)for(let px=0;px<w;px++)if(p[(py*w+px)*4+3]>=128){l=Math.min(l,px);r=Math.max(r,px);t=Math.min(t,py);b=Math.max(b,py);}
            if(r<l)throw Error('Empty sprite');
            return {x:x+l,y:y+t,width:r-l+1,height:b-t+1};
        };
        const draw=(c,src,f,x,y,w,h)=>{c.imageSmoothingEnabled=false;c.drawImage(src,f.x,f.y,f.width,f.height,x,y,w,h);};
        const connectedCrop=(c,x,y,w,h)=>{
            const p=c.getContext('2d').getImageData(x,y,w,h).data,seen=new Uint8Array(w*h);
            let largest=0,frame;
            for(let start=0;start<seen.length;start++){
                if(seen[start]||p[start*4+3]<128)continue;
                const stack=[start];seen[start]=1;let count=0,l=w,t=h,r=-1,b=-1;
                while(stack.length){
                    const k=stack.pop(),px=k%w,py=Math.floor(k/w);count++;
                    l=Math.min(l,px);r=Math.max(r,px);t=Math.min(t,py);b=Math.max(b,py);
                    for(const next of [px?k-1:-1,px<w-1?k+1:-1,py?k-w:-1,py<h-1?k+w:-1])if(next>=0&&!seen[next]&&p[next*4+3]>=128){seen[next]=1;stack.push(next);}
                }
                if(count>largest){largest=count;frame={x:x+l,y:y+t,width:r-l+1,height:b-t+1};}
            }
            if(!frame)throw Error('Empty connected sprite');return frame;
        };
        const canopySource=await load(sources.canopy),cf=crop(canopySource),canopy=canvas(480,Math.round(480*cf.height/cf.width));
        draw(canopy.getContext('2d'),canopySource,cf,0,0,canopy.width,canopy.height);
        const architecture=await load(sources.architecture),a=architecture.getContext('2d'),frames={},sprites={};
        a.clearRect(512,0,256,256);
        const ch=Math.round(248*cf.height/cf.width),cy=252-ch;
        draw(a,canopySource,cf,516,cy,248,ch);
        for(const [name,frame] of Object.entries(old.frames)){
            const f=name==='stationCanopy'?{x:516,y:cy,width:248,height:ch}:crop(architecture,frame.x,frame.y,frame.width,frame.height);
            frames[name]=f;const single=canvas(f.width,f.height);draw(single.getContext('2d'),architecture,f,0,0,f.width,f.height);sprites[name]=png(single);
        }
        sprites.stationCanopy=png(canopy);
        const lm=await load(sources.landmarks),landmarkFrames={};
        for(let i=0;i<6;i++)landmarkFrames[names[i]]=crop(lm,i%3*256,Math.floor(i/3)*256,256,256);
        // The clock cell includes a detached strip of the neighboring frontage's vegetation.
        // Select the complete connected clock/bracket rectangle; preserve pixels inside it.
        landmarkFrames.stationClock=connectedCrop(lm,256,256,256,256);
        const ins=await load(sources.insets),p=ins.getContext('2d').getImageData(0,0,ins.width,ins.height).data;
        // Generated gutters can drift; find real empty strips before cropping each complete insert.
        const cuts=axis=>{
            const length=axis==='x'?ins.width:ins.height,other=axis==='x'?ins.height:ins.width,edges=[0];
            for(let i=1;i<4;i++){
                const middle=length*i/4,radius=length/16,counts=[];
                for(let v=Math.floor(middle-radius);v<=middle+radius;v++){
                    let count=0;for(let j=0;j<other;j++){const x=axis==='x'?v:j,y=axis==='x'?j:v;if(p[(y*ins.width+x)*4+3]>=128)count++;}
                    counts.push({v,count});
                }
                const min=Math.min(...counts.map(v=>v.count)),best=counts.filter(v=>v.count===min);
                edges.push(best[Math.floor(best.length/2)].v);
            }
            return [...edges,length];
        };
        const xs=cuts('x'),ys=cuts('y'),insets=canvas(768,768),c=insets.getContext('2d');
        for(let row=0;row<4;row++)for(let col=0;col<4;col++){
            const f=crop(ins,xs[col],ys[row],xs[col+1]-xs[col],ys[row+1]-ys[row]),scale=Math.min(176/f.width,176/f.height);
            const w=Math.round(f.width*scale),h=Math.round(f.height*scale);
            draw(c,ins,f,col*192+Math.floor((192-w)/2),row*192+184-h,w,h);
        }
        return {architecture:png(architecture),canopy:png(canopy),insets:png(insets),frames,sprites,landmarkFrames,cuts:{xs,ys},canopySize:[canopy.width,canopy.height]};
    },{sources,old,names});
    await mkdir(out+'sprites',{recursive:true});
    for(const name of ['architecture','canopy','insets'])await writeFile(out+name+'-v6.png',Buffer.from(result[name],'base64'));
    await writeFile(out+'architecture-v6.json',JSON.stringify({version:1,frames:result.frames},null,2)+'\n');
    await writeFile(out+'landmarks-v6.json',JSON.stringify({version:1,frames:result.landmarkFrames},null,2)+'\n');
    await writeFile(out+'packing-v6.json',JSON.stringify({canopySize:result.canopySize,insetCuts:result.cuts},null,2)+'\n');
    for(const [name,b64] of Object.entries(result.sprites))await writeFile(out+'sprites/'+name+'-v6.png',Buffer.from(b64,'base64'));
    console.log('Packed complete canopy, sixteen inserts and tight architecture/landmark frames.',result.canopySize,result.cuts);
}finally{await browser.close();}
