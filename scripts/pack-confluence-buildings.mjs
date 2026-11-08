import {readFile,writeFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';
const directory='public/assets/environment/confluence/v5/';
const sources={};for(const key of ['walls','trims'])sources[key]=(await readFile(directory+'sources/'+key+'-source-v5.png')).toString('base64');
const browser=await chromium.launch();
try{
    const page=await browser.newPage();
    const result=await page.evaluate(async sources=>{
        const output={},frames={};
        for(const name of ['walls','trims']){
            const im=new Image();im.src='data:image/png;base64,'+sources[name];await im.decode();
            const source=document.createElement('canvas');source.width=im.width;source.height=im.height;
            const s=source.getContext('2d',{willReadFrequently:true});s.drawImage(im,0,0);
            const cell=name==='walls'?96:192,out=document.createElement('canvas');out.width=out.height=cell*4;
            const c=out.getContext('2d');c.imageSmoothingEnabled=false;
            for(let row=0;row<4;row++)for(let col=0;col<4;col++){
                let x=Math.round(col*im.width/4),y=Math.round(row*im.height/4),w=Math.round((col+1)*im.width/4)-x,h=Math.round((row+1)*im.height/4)-y;
                if(name==='walls'){x+=4;y+=4;w-=8;h-=8;c.drawImage(im,x,y,w,h,col*cell,row*cell,cell,cell);}
                else{
                    const p=s.getImageData(x,y,w,h).data;let l=w,t=h,r=-1,b=-1;
                    for(let py=0;py<h;py++)for(let px=0;px<w;px++)if(p[(py*w+px)*4+3]>128){l=Math.min(l,px);r=Math.max(r,px);t=Math.min(t,py);b=Math.max(b,py);}
                    if(r<l)throw Error('Empty trim');x+=l;y+=t;w=r-l+1;h=b-t+1;
                    const scale=Math.min(184/w,184/h),dw=Math.round(w*scale),dh=Math.round(h*scale),dx=col*cell+Math.floor((cell-dw)/2),dy=row*cell+Math.floor((cell-dh)/2);
                    c.drawImage(im,x,y,w,h,dx,dy,dw,dh);
                    frames[['station','residential','registry','archive'][row]+'-'+['left','right','band','roof'][col]]={x:dx,y:dy,width:dw,height:dh};
                }
            }
            output[name]=out.toDataURL('image/png').split(',')[1];
        }
        return {...output,frames};
    },sources);
    for(const name of ['walls','trims'])await writeFile(directory+name+'-v5.png',Buffer.from(result[name],'base64'));
    await writeFile(directory+'trims-v5.json',JSON.stringify({version:1,frames:result.frames},null,2)+'\n');
    console.log('Packed four building material families and sixteen transparent trims.');
}finally{await browser.close();}
