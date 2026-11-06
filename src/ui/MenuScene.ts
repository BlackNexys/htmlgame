export type MenuSceneId = 'watcher' | 'patient-traveller' | 'restless-flame' | 'absent-traveller';
export interface MenuAsset { readonly still: string; }
export interface MenuScene {
    readonly id: MenuSceneId;
    readonly background: MenuAsset;
    readonly foreground: MenuAsset;
    readonly souls: MenuAsset;
    /** Closest strong light: the cyan platform lantern, in station-frame coordinates. */
    readonly keyLight: {readonly x: number; readonly y: number};
    readonly character?: {
        readonly asset: MenuAsset;
        /** Position in the shared station frame, and anchor within the character image. */
        readonly position: {readonly x: number; readonly y: number};
        readonly anchor: {readonly x: number; readonly y: number};
        readonly width: number;
        readonly shadow: {
            /** Defaults to the pose anchor; seated poses need a separate ground contact. */
            readonly groundAnchor?: {readonly x: number; readonly y: number};
            /** Dimensions and cast length are fractions of the character image width. */
            readonly width: number; readonly depth: number; readonly length: number;
            readonly opacity: number;
        };
    };
    readonly ambientPreset: 'quiet-station';
    readonly rareEvents: readonly 'wandering-soul'[];
}

const asset = (name: string): MenuAsset => ({
    still: `./assets/mainmenu/stills/${name}.png`,
});
const station = {
    background: asset('station_background_ambient'), foreground: asset('station_foreground'), souls: asset('wandering_souls'),
    keyLight: {x: 791/1003, y: 94/565},
    ambientPreset: 'quiet-station', rareEvents: ['wandering-soul'],
} as const;

/** Placements measured against the 1003×565 foreground and 520×620 character sources. */
export const menuScenes: readonly MenuScene[] = [
    {id: 'watcher', ...station, character: {
        asset: asset('hero_standing'), position: {x: 680/1003,y: 417/565}, anchor: {x: 190/520,y: 561/620}, width: 168/1003,
        shadow: {width: .32, depth: .06, length: .12, opacity: .22},
    }},
    {id: 'patient-traveller', ...station, character: {
        asset: asset('hero_sitting'), position: {x: 851/1003,y: 398/565}, anchor: {x: 235/520,y: 367/620}, width: 151/1003,
        shadow: {groundAnchor: {x: 170/520,y: 561/620}, width: .34, depth: .06, length: .12, opacity: .16},
    }},
    {id: 'restless-flame', ...station, character: {
        asset: asset('hero_leaning'), position: {x: 797/1003,y: 417/565}, anchor: {x: 252/520,y: 561/620}, width: 168/1003,
        shadow: {width: .24, depth: .05, length: .085, opacity: .20},
    }},
    {id: 'absent-traveller', ...station},
];

/** An explicit preset supports repeatable previews; normal visits avoid the previous scene. */
export function selectMenuScene(previous?: string, random: () => number = Math.random, requested?: string | null): MenuScene {
    const fixed = menuScenes.find(scene => scene.id === requested);
    if (fixed) return fixed;
    const choices = menuScenes.filter(scene => scene.id !== previous);
    return choices[Math.min(choices.length-1,Math.max(0,Math.floor(random()*choices.length)))];
}
