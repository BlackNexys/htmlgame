import type { DialogueScene } from './DialogueScene';
import { stationDemo } from './stationDemo';

/** Same station premise, rewritten as short travelling lines; not story canon. */
export const actionDemo: DialogueScene = {
    id: 'station-on-the-move', title: 'Along the line',
    description: 'Noncanonical action dialogue study', label: 'DEMO',
    presentation: 'overlay', pacing: 'auto', speakers: stationDemo.speakers,
    commands: [
        {kind: 'line', speaker: 'attendant', expression: 'neutral', beats: [{text: 'Next train is late. You can keep walking.'}]},
        {kind: 'line', speaker: 'traveller', expression: 'amused', beats: [{text: 'How late?'}]},
        {kind: 'line', speaker: 'attendant', expression: 'amused', beats: [{text: 'I would not wait standing up.'}]},
        {kind: 'line', speaker: 'traveller', expression: 'worried', delivery: 'soft', beats: [
            {text: 'Someone is out there. ', pauseAfter: .25}, {text: 'I need to find them.', emphasis: 'strong'}]},
        {kind: 'line', speaker: 'attendant', expression: 'worried', delivery: 'soft', beats: [{text: 'Then follow the lights. I will listen.'}]},
        {kind: 'line', speaker: 'traveller', expression: 'neutral', beats: [{text: 'You have a station to run.'}]},
        {kind: 'line', speaker: 'attendant', expression: 'fierce', beats: [{text: 'And a very late train.', emphasis: 'strong'}]},
        {kind: 'line', speaker: 'traveller', expression: 'fierce', beats: [{text: 'All right. Walk with me.'}]},
    ], completionEffects: ['demo-heard'],
};
