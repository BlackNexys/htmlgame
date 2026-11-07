require('./register.cjs');
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {DialogueController} = require('../src/dialogue/DialogueController.ts');
const {CutsceneDirector} = require('../src/dialogue/CutsceneDirector.ts');
const {parseDialogueScene} = require('../src/dialogue/DialogueScene.ts');
const {stationDemo} = require('../src/dialogue/stationDemo.ts');

test('dialogue reveals grapheme clusters, respects authored pauses, and is frame-rate independent', () => {
    const line = {kind:'line',speaker:'traveller',expression:'neutral',beats:[{text:'A👩🏽‍🚀',pauseAfter:.5},{text:'e\u0301Z'}]};
    for(const fps of [30,60,144]) {
        const player = new DialogueController(line);
        player.update(.05,20); assert.equal(player.text,'A👩🏽‍🚀');
        player.update(.3,20); assert.equal(player.text,'A👩🏽‍🚀');
        for(let i=0;i<fps;i++)player.update(1/fps,20);
        assert.equal(player.text,'A👩🏽‍🚀e\u0301Z'); assert.equal(player.complete,true);
    }
    const player = new DialogueController(line); player.update(.01,0); assert.equal(player.complete,true);
});

test('advance reveals before changing speaker; waits and cues do not leak into the transcript', () => {
    const events=[]; const director=new CutsceneDirector(stationDemo,id=>events.push(id),result=>events.push(result));
    assert.equal(director.line.line.speaker,'attendant');
    director.advance(); assert.equal(director.line.complete,true); assert.equal(director.history.length,0);
    director.advance(); assert.equal(director.line.line.speaker,'traveller'); assert.equal(director.history.length,1);
    while(!director.result){if(director.line)director.advance();else director.update(1);}
    assert.equal(director.history.length,8); assert.deepEqual(events,['demo-heard','completed']);
    assert.equal(director.cue.focus,'wide');
});

test('normal completion and skip have identical effects exactly once per host run; cancellation awards nothing', () => {
    const applied=new Set(), effects=[], endings=[];
    const first=new CutsceneDirector(stationDemo,id=>effects.push(id),result=>endings.push(result),applied);
    first.skip(); first.skip(); first.advance(); first.update(20);
    assert.deepEqual(effects,['demo-heard']); assert.deepEqual(endings,['skipped']);
    const replay=new CutsceneDirector(stationDemo,id=>effects.push(id),result=>endings.push(result),applied);
    while(!replay.result){if(replay.line)replay.advance();else replay.update(1);}
    assert.deepEqual(effects,['demo-heard']);
    const cancelled=new CutsceneDirector(stationDemo,id=>effects.push(id),result=>endings.push(result));
    cancelled.cancel(); cancelled.skip(); assert.equal(cancelled.result,'cancelled'); assert.equal(effects.length,1);
    new CutsceneDirector(stationDemo,id=>effects.push(id),()=>{},new Set()).skip(); assert.equal(effects.length,2);
});

test('scene validation rejects invalid references, commands, portrait paths and timing without changing source data', () => {
    const parsed=parseDialogueScene(stationDemo); parsed.speakers.traveller.name='Changed';
    assert.equal(stationDemo.speakers.traveller.name,'Traveller');
    for(const mutate of [
        scene=>scene.commands[1].speaker='missing', scene=>scene.commands.push({kind:'unlockWeapon',id:'x'}),
        scene=>scene.commands.push({kind:'wait',seconds:-1}), scene=>scene.commands[1].beats[0].pauseAfter=Infinity,
        scene=>scene.speakers.traveller.portrait.image='https://example.com/test.png',
        scene=>scene.speakers.traveller.portrait.image='./assets/../../outside.png',
        scene=>scene.speakers.attendant.side='top', scene=>scene.commands=[],
        scene=>scene.completionEffects=['bad:id'],scene=>scene.completionEffects=['same','same'],
        scene=>scene.presentation='full-screen', scene=>scene.pacing='random',
        scene=>scene.commands[1].holdSeconds=-1,
    ]){const scene=structuredClone(stationDemo);mutate(scene);assert.throws(()=>parseDialogueScene(scene),/Invalid dialogue/);}
});

test('automatic dialogue starts its reading hold after reveal and manual scenes never auto-advance', () => {
    const scene=structuredClone(stationDemo); scene.presentation='overlay';
    scene.commands=scene.commands.filter(c=>c.kind==='line').slice(0,2);
    scene.commands[0].holdSeconds=1;
    const director=new CutsceneDirector(scene,()=>{},()=>{});
    director.speed=0; director.update(.01); assert.equal(director.line.complete,true);
    director.update(.5); assert.equal(director.history.length,0);
    director.update(.5); assert.equal(director.history.length,1);
    scene.pacing='manual';
    const manual=new CutsceneDirector(scene,()=>{},()=>{}); manual.speed=0;
    manual.update(100);manual.update(100);assert.equal(manual.history.length,0);
    manual.advance();assert.equal(manual.history.length,1);
});

test('automatic playback completes with the same effects at different presentation rates',()=>{
    const {actionDemo}=require('../src/dialogue/actionDemo.ts');
    for(const fps of [30,60,144]){
        const effects=[],director=new CutsceneDirector(actionDemo,id=>effects.push(id),()=>{});
        for(let i=0;i<90*fps && !director.result;i++)director.update(1/fps);
        assert.equal(director.result,'completed');assert.equal(director.history.length,8);
        assert.deepEqual(effects,['demo-heard']);
    }
});

test('a larger cast can share the two portrait positions without changing sequence or history', () => {
    const scene=structuredClone(stationDemo);
    scene.speakers.passenger={...scene.speakers.attendant,name:'Passenger',side:'right'};
    scene.commands.splice(1,0,{kind:'line',speaker:'passenger',expression:'amused',beats:[{text:'A different voice.'}]});
    const director=new CutsceneDirector(scene,()=>{},()=>{});
    assert.equal(director.line.line.speaker,'passenger'); director.advance();director.advance();
    assert.equal(director.history[0].speaker,'Passenger');assert.equal(director.line.line.speaker,'attendant');
});
