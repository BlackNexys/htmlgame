import type {worldSnapshot} from './WorldSnapshot';
declare global {interface Window {gameObservation?:(options?:{includeProps?:boolean})=>ReturnType<typeof worldSnapshot>|undefined;}}
/** Explicit opt-in observations only. No live references or gameplay commands. */
export class GameObservation {
    constructor(private readonly read:NonNullable<Window['gameObservation']>){
        if(new URLSearchParams(location.search).get('observe')==='1')Object.defineProperty(window,'gameObservation',{value:read,configurable:true});
    }
    dispose(){if(window.gameObservation===this.read)delete window.gameObservation;}
}
