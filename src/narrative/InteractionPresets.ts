import type { InteractableDefinition } from '../interfaces/Interactable';
type Preset=Omit<InteractableDefinition,'id'|'x'|'y'>;
export const interactionPresets:Readonly<Record<string,Preset>>={
    record:{kind:'inspect',label:'Transfer ledger',width:40,height:40,reach:80,sceneId:'transfer-record-card',effectId:'inspect-transfer-record'},
    letter:{kind:'collect',label:'Unfinished letter',width:24,height:20,reach:80,sceneId:'letter-card',effectId:'collect-letter'},
    terminal:{kind:'inspect',label:'Route index',width:40,height:56,reach:96,sceneId:'route-key-card',effectId:'decode-route',conditionId:'has-record'},
    gate:{kind:'operate',label:'Departure gate',width:48,height:192,reach:96,sceneId:'gate-card',effectId:'open-gate',conditionId:'knows-destination',solid:true},
};
