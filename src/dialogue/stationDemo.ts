import type { DialogueScene } from './DialogueScene';

/** Interface test writing, not the protagonist's established voice or setting canon. */
export const stationDemo: DialogueScene = {
    id: 'station-demo', title: 'The next departure', label: 'NONCANONICAL DEMO',
    description: 'Dialogue study · fictional test exchange · not canon',
    speakers: {
        traveller: {name: 'Traveller', role: 'A long way from home', side: 'left', accent: '#ff52ab',
            portrait: {image: './assets/hero/canon-v1/portraits-v1.png', row: 0}},
        attendant: {name: 'Attendant', role: 'Still on the clock', side: 'right', accent: '#63dfeb',
            portrait: {image: './assets/dialogue/portraits-v1.png', row: 1}},
    },
    commands: [
        {kind: 'cue', focus: 'wide', caption: 'A bell rings somewhere beyond the river.'},
        {kind: 'line', speaker: 'attendant', expression: 'neutral', beats: [
            {text: 'If you are waiting for the next train, '}, {text: 'take a seat.', emphasis: 'strong'}]},
        {kind: 'cue', focus: 'left', caption: ''},
        {kind: 'line', speaker: 'traveller', expression: 'amused', beats: [{text: 'How long is the wait?'}]},
        {kind: 'line', speaker: 'attendant', expression: 'amused', beats: [
            {text: 'Officially? ', pauseAfter: .45}, {text: 'A little while.', emphasis: 'soft'}]},
        {kind: 'line', speaker: 'traveller', expression: 'worried', delivery: 'soft', beats: [
            {text: 'I am looking for someone. ', pauseAfter: .35}, {text: 'I cannot stay here.', emphasis: 'strong'}]},
        {kind: 'cue', focus: 'right', caption: 'The attendant closes the timetable.'},
        {kind: 'wait', seconds: .65},
        {kind: 'line', speaker: 'attendant', expression: 'worried', delivery: 'soft', beats: [
            {text: 'Then tell me about them. ', pauseAfter: .3}, {text: 'The timetable can wait.'}]},
        {kind: 'line', speaker: 'traveller', expression: 'neutral', beats: [
            {text: 'You would do that for a stranger?'}]},
        {kind: 'line', speaker: 'attendant', expression: 'fierce', delivery: 'urgent', beats: [
            {text: 'I work here. ', emphasis: 'strong'}, {text: 'I can be late in my own station.'}]},
        {kind: 'cue', focus: 'left', caption: 'The little flame lifts.'},
        {kind: 'line', speaker: 'traveller', expression: 'fierce', beats: [
            {text: 'All right. ', pauseAfter: .3}, {text: 'Let me start again.', emphasis: 'strong'}]},
        {kind: 'cue', focus: 'wide', caption: 'For a moment, neither of them watches the clock.'},
        {kind: 'wait', seconds: .6},
    ],
    completionEffects: ['demo-heard'],
};
