import type { DialogueScene } from './DialogueScene';
import { stationDemo } from './stationDemo';

/** Staged test exchange, not established character voice or story canon. */
export const kineticDemo: DialogueScene = {
    id: 'station-exchange', title: 'A moment before departure',
    description: 'Expression and rhythm study', label: 'NONCANONICAL DEMO',
    presentation: 'kinetic', pacing: 'auto', speakers: stationDemo.speakers,
    commands: [
        {kind: 'line', speaker: 'attendant', expression: 'neutral', holdSeconds: 2,
            beats: [{text: 'The next train? ', pauseAfter: .25}, {text: 'Late.', emphasis: 'strong'}]},
        {kind: 'line', speaker: 'traveller', expression: 'amused', holdSeconds: 1.6,
            beats: [{text: 'How late?'}]},
        {kind: 'line', speaker: 'attendant', expression: 'amused', holdSeconds: 1.6,
            beats: [{text: 'Take a seat.'}]},
        {kind: 'line', speaker: 'traveller', expression: 'fierce', delivery: 'urgent', holdSeconds: 2,
            beats: [{text: 'I do not have ', emphasis: 'strong'}, {text: 'time.'}]},
        {kind: 'line', speaker: 'attendant', expression: 'fierce', holdSeconds: 2.8,
            beats: [{text: 'You are dead. ', pauseAfter: .3}, {text: 'You have plenty.', emphasis: 'strong'}]},
        {kind: 'line', speaker: 'traveller', expression: 'worried', delivery: 'soft', holdSeconds: 3,
            beats: [{text: 'Someone is waiting for me.'}]},
        {kind: 'line', speaker: 'attendant', expression: 'worried', delivery: 'soft', holdSeconds: 2.8,
            beats: [{text: 'Then ', pauseAfter: .3}, {text: 'start at the beginning.', emphasis: 'soft'}]},
        {kind: 'line', speaker: 'traveller', expression: 'fierce', holdSeconds: 1.8,
            beats: [{text: 'All right.', emphasis: 'strong'}]},
    ], completionEffects: ['demo-heard'],
};
