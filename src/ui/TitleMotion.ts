import type { MenuScene } from './MenuScene';

type Point = readonly [number, number];
type Layer = { image: HTMLCanvasElement; x: number; y: number; root: Point };
type MovingLayer = {layer: Layer; c: CanvasRenderingContext2D};
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const lamp: Point = [791, 48];

/** Local cutouts keep architecture, anatomy and attachment points pinned. */
function cutout(source: HTMLImageElement, base: CanvasRenderingContext2D, polygon: readonly Point[], root: Point): Layer {
    const x = Math.max(0, Math.floor(Math.min(...polygon.map(point => point[0])) - 18));
    const y = Math.max(0, Math.floor(Math.min(...polygon.map(point => point[1])) - 18));
    const image = document.createElement('canvas');
    image.width = Math.min(source.naturalWidth - x, Math.ceil(Math.max(...polygon.map(point => point[0])) - x + 18));
    image.height = Math.min(source.naturalHeight - y, Math.ceil(Math.max(...polygon.map(point => point[1])) - y + 18));
    const c = image.getContext('2d')!;
    c.drawImage(source, -x, -y);
    const mask = (context: CanvasRenderingContext2D, offsetX: number, offsetY: number) => {
        context.beginPath(); polygon.forEach(([px,py], index) => {
            if (index) context.lineTo(px - offsetX, py - offsetY); else context.moveTo(px - offsetX, py - offsetY);
        }); context.closePath(); context.fill();
    };
    c.globalCompositeOperation = 'destination-in'; mask(c, x, y);
    base.save(); base.globalCompositeOperation = 'destination-out'; mask(base, 0, 0); base.restore();
    return {image, x, y, root};
}

function buffer(source: HTMLImageElement) {
    const image = document.createElement('canvas'); image.width = source.naturalWidth; image.height = source.naturalHeight;
    const c = image.getContext('2d')!; c.drawImage(source,0,0); return {image,c};
}

/** One presentation-only RAF chain; no GIF decoding or game simulation work. */
export class TitleMotion {
    private readonly platform: HTMLCanvasElement;
    private readonly details: HTMLCanvasElement;
    private readonly hero: HTMLCanvasElement;
    private readonly movingDetails: HTMLElement;
    private readonly p: CanvasRenderingContext2D | null;
    private readonly d: CanvasRenderingContext2D | null;
    private readonly h: CanvasRenderingContext2D | null;
    private readonly light: CanvasRenderingContext2D | null;
    private readonly clock: CanvasRenderingContext2D | null;
    private readonly cat: CanvasRenderingContext2D | null;
    private station?: HTMLCanvasElement;
    private body?: HTMLCanvasElement;
    private lantern?: Layer;
    private vines: Layer[] = [];
    private moving: MovingLayer[] = [];
    private flame?: Layer;
    private cape?: Layer;
    private scene?: MenuScene;
    private foregroundSource = '';
    private heroSource = '';
    private frameId?: number;
    private last = 0;
    private elapsed = 0;
    private running = false;

    constructor(private readonly root: HTMLElement) {
        this.platform = root.querySelector<HTMLCanvasElement>('.menu-platform-motion')!;
        this.details = root.querySelector<HTMLCanvasElement>('.menu-details-motion')!;
        this.hero = root.querySelector<HTMLCanvasElement>('.menu-character-motion')!;
        this.movingDetails = root.querySelector<HTMLElement>('.menu-moving-details')!;
        this.p = this.platform.getContext('2d'); this.d = this.details.getContext('2d');
        this.h = this.hero.getContext('2d');
        this.light = this.surface('.menu-lantern-light',747,58);
        this.clock = this.surface('.menu-clock-hand',852,48);
        this.cat = this.surface('.menu-cat-sleep',898,326);
    }

    private surface(selector: string, x: number, y: number) {
        const canvas = this.root.querySelector<HTMLCanvasElement>(selector)!;
        this.place(canvas,x,y); return canvas.getContext('2d');
    }
    private place(canvas: HTMLCanvasElement, x: number, y: number) {
        Object.assign(canvas.style,{left:`${x/1003*100}%`,top:`${y/565*100}%`,width:`${canvas.width/1003*100}%`,height:`${canvas.height/565*100}%`});
    }

    select(scene: MenuScene) {
        this.scene = scene; this.body = this.flame = this.cape = undefined; this.heroSource = '';
        this.root.dataset.heroMotion = 'false'; this.elapsed = 0;
    }
    refresh(foreground: HTMLImageElement, character: HTMLImageElement) {
        if (!this.p || !this.d || !this.h || !this.light || !this.clock || !this.cat) return;
        if (foreground.complete && foreground.naturalWidth && this.foregroundSource !== foreground.src) {
            const {image,c} = buffer(foreground); this.station = image; this.foregroundSource = foreground.src;
            this.lantern = cutout(foreground,c,[[775,57],[801,57],[815,79],[817,117],[805,136],[779,136],[765,118],[764,80]],lamp);
            this.vines = [
                cutout(foreground,c,[[739,207],[763,207],[771,254],[763,289],[750,259]], [754,207]),
                cutout(foreground,c,[[486,441],[503,441],[510,473],[504,512],[491,485]], [495,441]),
                cutout(foreground,c,[[680,517],[712,517],[726,553],[716,565],[692,559]], [697,517]),
                cutout(foreground,c,[[551,483],[569,483],[583,528],[566,551],[557,523]], [560,483]),
            ];
            // Masked architecture is cached once. Only these small surfaces repaint.
            this.p.clearRect(0,0,1003,565); this.p.drawImage(image,0,0);
            this.d.clearRect(0,0,1003,565); this.d.drawImage(image,0,0);
            this.movingDetails.replaceChildren();
            this.moving = [this.lantern,...this.vines].map(layer => {
                const canvas = document.createElement('canvas'); canvas.className = 'menu-part-canvas';
                canvas.width = layer.image.width; canvas.height = layer.image.height;
                this.place(canvas,layer.x,layer.y); this.movingDetails.append(canvas);
                return {layer,c:canvas.getContext('2d')!};
            });
            this.root.dataset.foregroundMotion = 'true';
        }
        if (this.scene?.character && character.complete && character.naturalWidth && this.heroSource !== character.src) {
            const {image,c} = buffer(character); this.body = image; this.heroSource = character.src;
            const sitting = this.scene.id === 'patient-traveller', leaning = this.scene.id === 'restless-flame';
            const rootY = sitting ? 204 : leaning ? 157 : 187;
            this.flame = cutout(character,c,[[90,0],[440,0],[440,170],[284,rootY+31],[105,rootY+31]],[170,rootY]);
            this.cape = cutout(character,c,[[245,230],[474,247],[488,399],[409,472],[279,450],[241,345]],[leaning ? 290 : 265,255]);
            this.root.dataset.heroMotion = 'true';
        }
        this.draw();
    }

    play(active: boolean) {
        if (active === this.running) return;
        this.running = active && !!this.p && !!this.d && !!this.h && !!this.light && !!this.clock && !!this.cat;
        this.last = 0;
        if (!this.running) {
            if (this.frameId !== undefined) cancelAnimationFrame(this.frameId);
            this.frameId = undefined; return;
        }
        this.draw(); this.frameId = requestAnimationFrame(this.frame);
    }
    dispose() { this.play(false); this.station = this.body = undefined; this.vines = []; this.moving = []; this.movingDetails.replaceChildren(); }

    private readonly frame = (time: number) => {
        if (!this.running) return;
        if (this.last) this.elapsed += Math.min(.05, Math.max(0, (time-this.last)/1000));
        this.last = time;
        try { this.draw(); } catch {
            // A presentation failure restores native stills without blocking the menu.
            this.play(false); this.root.dataset.foregroundMotion = this.root.dataset.heroMotion = 'false'; return;
        }
        this.frameId = requestAnimationFrame(this.frame);
    };

    private draw() {
        if (!this.p || !this.d || !this.h || !this.light || !this.clock || !this.cat) return;
        const t = this.elapsed;
        if (this.station) {
            this.moving.forEach(({layer,c},index) => {
                c.clearRect(0,0,c.canvas.width,c.canvas.height); c.save(); c.translate(-layer.x,-layer.y);
                if (!index) {
                    c.translate(...lamp); c.rotate(Math.sin(t*.95)*.008);
                    c.drawImage(layer.image,layer.x-lamp[0],layer.y-lamp[1]);
                } else this.breeze(c,layer,t,index-1);
                c.restore();
            });
        }
        if (this.body) {
            const c = this.h; c.clearRect(0,0,520,620); c.drawImage(this.body,0,0);
            if (this.cape) {
                const layer = this.cape;
                for(let x=0;x<layer.image.width;x+=3) {
                    const width = Math.min(3,layer.image.width-x);
                    const weight = Math.pow(clamp((layer.x+x-layer.root[0])/165),1.4);
                    const dy = weight*(7*Math.sin(t*1.65+x*.018)+2.5*Math.sin(t*2.7+x*.032));
                    c.drawImage(layer.image,x,0,width,layer.image.height,layer.x+x,layer.y+dy,width,layer.image.height);
                }
            }
            if (this.flame) {
                const layer = this.flame, rootY = layer.root[1];
                c.save(); const scale = 1+.012*Math.sin(t*8)+.007*Math.sin(t*13.1);
                c.translate(0,rootY); c.scale(1,scale); c.translate(0,-rootY);
                for(let y=0;y<layer.image.height;y+=2) {
                    const height = Math.min(2,layer.image.height-y);
                    const weight = Math.pow(clamp((rootY-layer.y-y)/145),1.5);
                    const dx = weight*(10*Math.sin(t*5.4+y*.047)+4*Math.sin(t*9.7+y*.081)+3*Math.sin(t*1.1));
                    c.drawImage(layer.image,0,y,layer.image.width,height,layer.x+dx,layer.y+y,layer.image.width,height);
                }
                c.restore();
                this.embers(c,t,rootY);
            }
        }
        this.ambience(t);
    }

    private breeze(c: CanvasRenderingContext2D, layer: Layer, t: number, phase: number) {
        for(let y=0;y<layer.image.height;y+=3) {
            const height = Math.min(3,layer.image.height-y), weight = Math.pow(clamp((layer.y+y-layer.root[1])/65),1.6);
            const dx = weight*(2.6*Math.sin(t*1.05+phase)+.8*Math.sin(t*1.9+y*.05));
            c.drawImage(layer.image,0,y,layer.image.width,height,layer.x+dx,layer.y+y,layer.image.width,height);
        }
    }
    private embers(c: CanvasRenderingContext2D, t: number, rootY: number) {
        for(let i=0;i<5;i++) {
            const phase = (t*.38+i*.23)%1;
            const alpha = Math.sin(phase*Math.PI)*.55;
            c.globalAlpha = alpha; c.fillStyle = i%2 ? '#ff95dd' : '#f43eb1';
            c.fillRect(223+phase*95+Math.sin(t*2+i)*5,rootY-60-phase*95,2,2);
        }
        c.globalAlpha = 1;
    }
    private ambience(t: number) {
        const c = this.light!, k = this.clock!, z = this.cat!;
        c.clearRect(0,0,86,86); k.clearRect(0,0,80,96); z.clearRect(0,0,60,60);
        if (!this.station) return;
        // Slow coherent flicker, not random per-frame flashes.
        const glow = .065+.012*Math.sin(t*2.7)+.009*Math.sin(t*5.3)+.004*Math.sin(t*11.1);
        c.save(); c.translate(-747,-58); c.globalCompositeOperation = 'screen';
        const halo = c.createRadialGradient(790,101,3,790,101,43);
        halo.addColorStop(0,`rgba(100,244,255,${glow*1.8})`); halo.addColorStop(.5,`rgba(33,197,235,${glow*.65})`); halo.addColorStop(1,'rgba(33,197,235,0)');
        c.fillStyle = halo; c.fillRect(747,58,86,86);
        c.restore();
        // The painted hour/minute hands stay intact; a fine second hand sweeps the face.
        const angle = t*Math.PI/30;
        k.save(); k.translate(-852,-48);
        k.strokeStyle = 'rgba(229,190,153,.85)'; k.lineWidth = .8; k.beginPath();
        k.moveTo(892-Math.sin(angle)*5,93+Math.cos(angle)*6);
        k.lineTo(892+Math.sin(angle)*27,93-Math.cos(angle)*33); k.stroke();
        k.fillStyle = '#d9ad8b'; k.fillRect(891,92,2,2); k.restore();
        // Soft, staggered Zs rise from the sleeping cat; no movement of the bench.
        z.save(); z.translate(-898,-326); z.font = '7px monospace'; z.textAlign = 'center'; z.fillStyle = '#d4dbea';
        for(let i=0;i<3;i++) {
            const phase = ((t+i*1.5)%4.8)/4.8;
            z.globalAlpha = Math.sin(phase*Math.PI)*.65;
            z.fillText(i===2?'Z':'z',911+phase*20+Math.sin(phase*4)*2,365-phase*24);
        }
        z.restore();
    }
}
