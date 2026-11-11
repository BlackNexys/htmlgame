import { heroFaceAtlas } from '../game/animation/HeroFaceAtlas';

/** Cole's shared material ramps. Applied once per loaded atlas, never per frame.
 * The source drawings, alpha, landmarks and collision geometry remain untouched. */
export const heroPalette = {
    leather: ['#0c111c','#151d2b','#232d3c','#354151','#4b5765','#69727c'],
    cloth: ['#240f25','#3c142e','#581a39','#742044','#912b51','#ad4163'],
    straps: ['#291b24','#493039','#6c4549','#93605b','#bb8372'],
    bone: ['#766969','#a18d80','#c4b19a','#e1d0b4','#f4e8cf'],
    fire: ['#570d48','#8d0e63','#bf147e','#e92c97','#ff50ad','#ff8acb','#ffe0eb'],
    vial: ['#164455','#1d7489','#28a7b9','#5ad7dc','#bcf5eb'],
} as const;
const ramps = Object.fromEntries(Object.entries(heroPalette).map(([key,values]) =>
    [key,values.map(hex => [1,3,5].map(start => parseInt(hex.slice(start,start+2),16)))])) as Record<keyof typeof heroPalette,number[][]>;

export function heroColor(r: number, g: number, b: number, head = false): readonly number[] {
    const max=Math.max(r,g,b), min=Math.min(r,g,b), saturation=(max-min)/Math.max(1,max);
    let material: keyof typeof heroPalette, value: number;
    if (g>r*1.35 && b>r*1.3) { material='vial'; value=(max-55)/200; }
    else if (head && r>85 && b>r*.35 && g<r*.85 && saturation>.2) {
        material='fire'; value=(r*.6+g*.25+b*.15-55)/200;
    } else if (r>g*1.35 && r>b*1.04 && saturation>.55) {
        material='cloth'; value=(r-35)/175;
    } else if (min>120 && max>175 && saturation<.32) { material='bone'; value=(max-120)/125; }
    else if (r>g*1.12 && r>b*1.16) { material='straps'; value=(max-30)/170; }
    else { material='leather'; value=(max-18)/160; }
    const ramp=ramps[material];
    return ramp[Math.max(0,Math.min(ramp.length-1,Math.round(value*(ramp.length-1))))];
}

const cache=new WeakMap<HTMLImageElement,HTMLCanvasElement>();
export function heroPaletteImage(image: HTMLImageElement): HTMLCanvasElement {
    const cached=cache.get(image);if(cached)return cached;
    const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    const c=canvas.getContext('2d')!;c.drawImage(image,0,0);
    const faces=image.naturalWidth===2048?heroFaceAtlas.gameplay:heroFaceAtlas.aiming;
    const pixels=c.getImageData(0,0,canvas.width,canvas.height),lookup=new Map<number,readonly number[]>();
    for(let i=0;i<pixels.data.length;i+=4) {
        if(!pixels.data[i+3])continue;
        const x=i/4%canvas.width,y=Math.floor(i/4/canvas.width);
        const face=faces[Math.floor(y/256)]?.[Math.floor(x/256)];
        const head=!!face && y%256<face[1]+face[3]*.85;
        const r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2],key=(head?1<<24:0)|r<<16|g<<8|b;
        let color=lookup.get(key);if(!color){color=heroColor(r,g,b,head);lookup.set(key,color);}
        pixels.data[i]=color[0];pixels.data[i+1]=color[1];pixels.data[i+2]=color[2];
    }
    c.putImageData(pixels,0,0);cache.set(image,canvas);return canvas;
}
