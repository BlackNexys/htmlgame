import { selectMenuScene, type MenuAsset, type MenuScene } from './MenuScene';
import type { MenuMotion } from './GamePreferences';

const previousKey = 'underworld-menu-scene:v1';

/** Native GIF layers; menu state selects the scene and controls motion, never the simulation. */
export class TitleScene {
    private readonly layers: HTMLImageElement[];
    private readonly character: HTMLImageElement;
    private readonly shadow: HTMLElement;
    private readonly reduced = matchMedia('(prefers-reduced-motion: reduce)');
    private readonly events = new AbortController();
    private readonly failed = new Set<string>();
    private scene?: MenuScene;
    private previous?: string;
    private active = false;
    private motion: MenuMotion = 'system';
    private disposed = false;

    constructor(private readonly root: HTMLElement) {
        this.layers = [...root.querySelectorAll<HTMLImageElement>('[data-menu-layer]')];
        this.character = root.querySelector<HTMLImageElement>('.menu-character')!;
        this.shadow = root.querySelector<HTMLElement>('.menu-hero-shadow')!;
        try { this.previous = sessionStorage.getItem(previousKey) || undefined; } catch { /* Session selection still works. */ }
        const options = {signal: this.events.signal};
        this.reduced.addEventListener('change', this.sync, options);
        document.addEventListener('visibilitychange', this.sync, options);
        for (const image of this.layers) image.addEventListener('error', () => this.fallback(image), options);
    }

    show() {
        if (this.disposed) return;
        if (!this.active) this.select();
        this.active = true; this.sync();
    }
    hide() { this.active = false; this.sync(); }
    preferences(motion: MenuMotion) { this.motion = motion; this.sync(); }
    dispose() { this.hide(); this.disposed = true; this.events.abort(); }

    private select() {
        this.scene = selectMenuScene(this.previous, Math.random, new URLSearchParams(location.search).get('menuScene'));
        this.previous = this.scene.id;
        try { sessionStorage.setItem(previousKey,this.scene.id); } catch { /* No persistence required to render. */ }
        this.root.dataset.scene = this.scene.id;
        this.root.dataset.ambient = this.scene.ambientPreset;
        this.root.dataset.souls = String(this.scene.rareEvents.includes('wandering-soul'));
        const character = this.scene.character;
        this.character.hidden = !character;
        this.shadow.hidden = !character;
        if (character) {
            this.character.style.left = `${character.position.x*100}%`;
            this.character.style.top = `${character.position.y*100}%`;
            this.character.style.width = `${character.width*100}%`;
            this.character.style.transform = `translate(${-character.anchor.x*100}%,${-character.anchor.y*100}%)`;
            this.placeShadow(character,this.scene.keyLight);
        } else this.character.removeAttribute('src');
    }

    private placeShadow(character: NonNullable<MenuScene['character']>, light: MenuScene['keyLight']) {
        const {shadow,anchor,position} = character, ground = shadow.groundAnchor ?? anchor;
        const characterWidth = character.width*1003, characterHeight = characterWidth*620/520;
        const x = position.x*1003+(ground.x-anchor.x)*characterWidth;
        const y = position.y*565+(ground.y-anchor.y)*characterHeight;
        const width = shadow.width*characterWidth, depth = shadow.depth*characterWidth;
        // Compress the light direction onto the painted platform's shallow ground plane.
        const dx = x-light.x*1003, dy = (y-light.y*565)*.25, distance = Math.hypot(dx,dy) || 1;
        const castX = dx/distance*shadow.length*characterWidth, castY = dy/distance*shadow.length*characterWidth;
        const angle = Math.min(15,Math.atan2(castY,width+Math.abs(castX))*180/Math.PI)*Math.sign(castX);
        Object.assign(this.shadow.style,{left: `${x/1003*100}%`,top: `${y/565*100}%`,width: `${width/1003*100}%`,height: `${depth/565*100}%`});
        this.shadow.style.setProperty('--shadow-cast-x',`${castX/width*100}%`);
        this.shadow.style.setProperty('--shadow-cast-y',`${castY/depth*100}%`);
        this.shadow.style.setProperty('--shadow-angle',`${angle}deg`);
        this.shadow.style.setProperty('--shadow-opacity',String(shadow.opacity));
        this.shadow.style.setProperty('--shadow-cast-opacity',String(shadow.opacity*.55));
    }

    private asset(image: HTMLImageElement): MenuAsset | undefined {
        switch (image.dataset.menuLayer) {
            case 'background': return this.scene?.background;
            case 'foreground': return this.scene?.foreground;
            case 'souls': return this.scene?.souls;
            case 'character': return this.scene?.character?.asset;
        }
    }
    private readonly sync = () => {
        if (this.disposed || !this.scene) return;
        const playing = this.active && !document.hidden;
        const animate = playing && (this.motion === 'animated' || (this.motion === 'system' && !this.reduced.matches));
        this.root.dataset.playing = String(playing);
        this.root.dataset.motion = animate ? 'animated' : 'still';
        for (const image of this.layers) {
            const asset = this.asset(image);
            if (!asset) continue;
            const source = animate && !this.failed.has(asset.animation) ? asset.animation : asset.still;
            if (image.getAttribute('src') !== source) image.src = source;
        }
    };
    private fallback(image: HTMLImageElement) {
        const asset = this.asset(image);
        if (!asset || image.getAttribute('src') !== asset.animation) return;
        this.failed.add(asset.animation); image.src = asset.still;
    }
}
