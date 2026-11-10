import type {DialogueScene} from './DialogueScene';
import {stationDemo} from './stationDemo';

/** Provisional writing for the first experience slice; no discoveries or campaign effects. */
export const lightLeftOn: DialogueScene = {
    id: 'light-left-on', title: 'A light left on', description: 'A quiet moment after the crossing', label: 'DRAFT SCENE',
    presentation: 'kinetic', pacing: 'manual', speakers: stationDemo.speakers,
    commands: [
        {kind: 'line', speaker: 'attendant', expression: 'neutral', beats: [{text: 'You keep watching the bridge.'}]},
        {kind: 'line', speaker: 'traveller', expression: 'worried', delivery: 'soft', beats: [{text: 'I am looking for someone.'}]},
        {kind: 'line', speaker: 'attendant', expression: 'neutral', beats: [{text: 'Then why look behind you?'}]},
        {kind: 'line', speaker: 'traveller', expression: 'worried', beats: [{text: 'In case they are looking ', pauseAfter: .3}, {text: 'for me.', emphasis: 'soft'}]},
        {kind: 'line', speaker: 'attendant', expression: 'amused', delivery: 'soft', beats: [{text: 'I will keep this light on.'}]},
        {kind: 'line', speaker: 'traveller', expression: 'neutral', delivery: 'soft', beats: [{text: 'Thank you.'}]},
    ], completionEffects: [],
};
