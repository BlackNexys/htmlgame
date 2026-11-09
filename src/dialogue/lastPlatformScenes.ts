import type { DialogueScene, DialogueLine, Expression, Delivery } from './DialogueScene';
import { stationDemo } from './stationDemo';

const line = (speaker: string, text: string, expression: Expression = 'neutral', delivery: Delivery = 'normal'): DialogueLine => ({
    kind:'line', speaker, expression, delivery, beats:[{text}],
});
const scene = (id: string, commands: DialogueLine[], completionEffects: string[] = []): DialogueScene => ({
    id, title:'The Last Platform · A lead, not an answer',
    description:'Candidate dialogue from the Last Platform demo brief, not locked canon.',
    label:'DEMO · DRAFT', presentation:'kinetic', pacing:'auto',
    speakers:stationDemo.speakers, commands, completionEffects,
});

export const lastPlatformScenes: Readonly<Record<string,DialogueScene>> = {
    'platform-introduction': scene('platform-introduction',[
        line('attendant',"You came in on the late line. That doesn’t happen often."),
        line('traveller','Where am I?','worried'),
        line('attendant','Last Platform. Confluence side. Please keep clear of the tracks.'),
        line('traveller',"I’m looking for my girlfriend. I think she came through here.",'worried','urgent'),
        line('attendant','Then try the Registry. Take the upper viaduct east and follow the Registry signs. Transfers are kept at the east desk.','neutral','soft'),
        line('traveller','You sound like this happens all the time.'),
        line('attendant','People losing things? Constantly. People finding them? Less often.','amused'),
        line('traveller',"I’ll improve the statistics.",'fierce'),
    ],['platform-introduction']),
    'platform-directions': scene('platform-directions',[
        line('attendant','Upper viaduct east. Follow the signs to the Registry reading gallery. If you reach freight first, look for the Registry stair.'),
        line('attendant',"And don’t ask a ghoul for directions. They’ll follow you home.",'amused'),
    ]),
    'platform-record-reaction': scene('platform-record-reaction',[
        line('traveller',"Her name’s in the transfer book. Route S-17.",'worried'),
        line('attendant','S-17 leads beyond this platform. The lower index confirms the outbound route.','worried'),
        line('traveller','Who signed the transfer?','fierce'),
        line('attendant',"The ledger doesn’t say. Don’t make a villain out of a missing signature."),
        line('traveller',"Someone knows. I’ll find out who.",'fierce'),
    ],['platform-record-reaction']),
    'platform-farewell': scene('platform-farewell',[
        line('attendant','Your route is known. Release the departure shutter and keep clear of the tracks.'),
        line('traveller','A lead. Not an answer.','worried'),
    ]),
};
