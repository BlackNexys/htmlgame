import { characterAtlas } from '../game/animation/CharacterAtlas';
export type MenuSceneId = 'watcher' | 'patient-traveller' | 'restless-flame' | 'absent-traveller';
export interface MenuAsset {readonly still: string;}
export interface MenuScene {
    readonly id: MenuSceneId;
    readonly pose?: 'standing'|'sitting'|'leaning';
    readonly poster: string;
    readonly background: MenuAsset;
    readonly foreground: MenuAsset;
    readonly character?: {readonly asset: MenuAsset;readonly position: {x: number;y: number};readonly width: number};
}
export const titleArtRoot='./assets/mainmenu/v3/production/';
export const confluenceArtRoot='./assets/mainmenu/confluence-v1/';
const asset=(name: string): MenuAsset=>({still:name==='standing'?'./assets/'+characterAtlas.image:['sitting','leaning'].includes(name)?'./assets/hero/canon-v1/'+name+'-v1.png':titleArtRoot+name+'-v1.png'});
const station={background:asset('background'),foreground:asset('foreground')};
export const menuScenes: readonly MenuScene[]=[
    {id:'watcher',pose:'standing',poster:titleArtRoot+'poster-watcher-v1.png',...station,character:{asset:asset('standing'),position:{x:1120/1672,y:722/941},width:300/1672}},
    {id:'patient-traveller',pose:'sitting',poster:titleArtRoot+'poster-patient-traveller-v1.png',...station,character:{asset:asset('sitting'),position:{x:1460/1672,y:750/941},width:300/1672}},
    {id:'restless-flame',pose:'leaning',poster:titleArtRoot+'poster-restless-flame-v1.png',...station,character:{asset:asset('leaning'),position:{x:1355/1672,y:724/941},width:300/1672}},
    {id:'absent-traveller',poster:titleArtRoot+'poster-absent-traveller-v1.png',...station},
];

/** Repeatable explicit previews; ordinary visits avoid the last scene. */
export function selectMenuScene(previous?: string,random: ()=>number=Math.random,requested?: string|null): MenuScene {
    const fixed=menuScenes.find(scene=>scene.id===requested);
    if(fixed)return fixed;
    const choices=menuScenes.filter(scene=>scene.id!==previous);
    return choices[Math.min(choices.length-1,Math.max(0,Math.floor(random()*choices.length)))];
}
