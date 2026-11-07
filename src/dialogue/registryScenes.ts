import type { DialogueScene, DialogueLine } from './DialogueScene';
import { stationDemo } from './stationDemo';
const line=(speaker:string,text:string,expression:DialogueLine['expression']='neutral'):DialogueLine=>({kind:'line',speaker,expression,beats:[{text}]});
const scene=(id:string,commands:DialogueLine[],effects:string[]):DialogueScene=>({id,title:'A lead along the Deadways',description:'Noncanonical narrative systems prototype',label:'NARRATIVE STUDY',presentation:'kinetic',pacing:'auto',speakers:stationDemo.speakers,commands,completionEffects:effects});
export const registryScenes:Readonly<Record<string,DialogueScene>>={
    'attendant-introduction':scene('attendant-introduction',[line('traveller','I am looking for someone.'),line('attendant','Try the Registry. Arrival and transfer ledgers are kept to the east.','neutral'),line('traveller','A place to start. Thank you.','fierce')],['attendant-introduction']),
    'attendant-directions':scene('attendant-directions',[line('attendant','The Registry is east of here. Look for the transfer ledger.','amused')],[]),
    'attendant-record':scene('attendant-record',[line('traveller','Her name is in a transfer entry. Route S-17.','worried'),line('attendant','That route leads beyond this platform. The index confirms the destination.','neutral'),line('traveller','So someone sent her away?','fierce'),line('attendant','The record does not tell us that. Find out before you decide.','worried')],['attendant-record']),
    'attendant-farewell':scene('attendant-farewell',[line('attendant','You have a destination. Open the gate, and follow the lead.','neutral'),line('traveller','A lead. Not an answer.','worried')],[]),
};
