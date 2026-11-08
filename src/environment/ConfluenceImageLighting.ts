/** Darken the art itself, preserving its original alpha and its occlusion of walls behind it. */
export class ConfluenceImageLighting {
    private readonly cache=new Map<number,HTMLCanvasElement>();
    constructor(private readonly image:HTMLImageElement|HTMLCanvasElement){}
    at(light:number):HTMLImageElement|HTMLCanvasElement{
        if(light>=1)return this.image;
        let canvas=this.cache.get(light);if(canvas)return canvas;
        canvas=document.createElement('canvas');
        canvas.width='naturalWidth' in this.image?this.image.naturalWidth:this.image.width;
        canvas.height='naturalHeight' in this.image?this.image.naturalHeight:this.image.height;
        const c=canvas.getContext('2d')!;c.imageSmoothingEnabled=false;c.drawImage(this.image,0,0);
        c.globalCompositeOperation='source-atop';c.globalAlpha=1-Math.max(0,light);
        c.fillStyle='#08131b';c.fillRect(0,0,canvas.width,canvas.height);
        this.cache.set(light,canvas);return canvas;
    }
}
