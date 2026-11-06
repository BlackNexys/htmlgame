require('./register.cjs');
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {GameLoop} = require('../src/game/GameLoop.ts');
const {Input} = require('../src/game/Input.ts');

function scheduler() {
    let time=0,id=0;const pending=new Map();
    return {
        request(callback){pending.set(++id,callback);return id;},
        cancel(id){pending.delete(id);},now(){return time;},
        tick(milliseconds){time+=milliseconds;const callbacks=[...pending.values()];pending.clear();callbacks.forEach(callback=>callback(time));},
        get pending(){return pending.size;},
    };
}

test('loop start is idempotent, pause keeps drawing, resume drops backlog, and stop cancels the next frame',()=>{
    const frames=scheduler();let updates=0,draws=0;
    const loop=new GameLoop(()=>updates++,()=>draws++,frames);
    loop.start();loop.start();assert.equal(frames.pending,1);
    loop.resume();frames.tick(1000/60);assert.equal(updates,2);
    loop.pause();frames.tick(10000);assert.equal(updates,2);assert.equal(draws,2);
    loop.resume();frames.tick(1000/60);assert.equal(updates,4);
    loop.stop();assert.equal(frames.pending,0);
    frames.tick(1000);assert.equal(updates,4);assert.equal(draws,3);
    loop.start();loop.resume();frames.tick(1000/60);assert.equal(updates,6);
    assert.equal(frames.pending,1);loop.stop();
});

test('stopping inside an update prevents remaining updates and another animation frame',()=>{
    const frames=scheduler();let updates=0;
    const loop=new GameLoop(()=>{updates++;loop.stop();},()=>{},frames);
    loop.start();loop.resume();frames.tick(1000/30);
    assert.equal(updates,1);assert.equal(frames.pending,0);
    frames.tick(1000);assert.equal(updates,1);
});

test('input handles held aliases and one-shot jumps, clears on blur, and removes listeners on disposal',()=>{
    const canvas=new EventTarget(),host=new EventTarget(),actions=[];
    const input=new Input(canvas,key=>actions.push(key),host);
    const key=(type,code,repeat=false)=>{
        const event=new Event(type,{cancelable:true});
        Object.defineProperties(event,{code:{value:code},repeat:{value:repeat}});canvas.dispatchEvent(event);
    };
    key('keydown','KeyD');key('keydown','ArrowRight');key('keyup','KeyD');
    assert.equal(input.sample().right,true);
    key('keydown','Space');assert.equal(input.sample().jump,true);
    key('keydown','Space',true);assert.equal(input.sample().jump,false);
    host.dispatchEvent(new Event('blur'));assert.equal(input.sample().right,false);
    key('keydown','KeyP');assert.deepEqual(actions,['KeyP']);
    input.dispose();key('keydown','KeyD');key('keydown','KeyR');
    assert.equal(input.sample().right,false);assert.deepEqual(actions,['KeyP']);
});

test('input snapshots retain held actions and consume logical press and release edges once',()=>{
    const canvas=new EventTarget(),input=new Input(canvas,()=>{},new EventTarget());
    const key=(type,code,repeat=false)=>{
        const event=new Event(type,{cancelable:true});
        Object.defineProperties(event,{code:{value:code},repeat:{value:repeat}});canvas.dispatchEvent(event);
    };
    key('keydown','ShiftLeft');key('keydown','KeyW');key('keydown','KeyS');key('keydown','KeyJ');
    let sample=input.sample();
    assert.equal(sample.jump,false);assert.equal(sample.up,true);assert.equal(sample.down,true);
    assert.equal(sample.sprint,true);assert.equal(sample.fire,true);
    assert.deepEqual(new Set(sample.pressed),new Set(['sprint','up','down','fire']));
    key('keydown','ShiftRight');key('keyup','ShiftLeft');key('keydown','KeyJ',true);
    sample=input.sample();assert.equal(sample.sprint,true);assert.equal(sample.fire,true);
    assert.deepEqual(sample.pressed,[]);assert.deepEqual(sample.released,[]);
    key('keyup','ShiftRight');key('keyup','KeyJ');key('keydown','Space');
    sample=input.sample();assert.equal(sample.jump,true);assert.equal(sample.jumpHeld,true);
    assert.deepEqual(new Set(sample.released),new Set(['sprint','fire']));
    sample=input.sample();assert.equal(sample.jump,false);assert.equal(sample.jumpHeld,true);assert.deepEqual(sample.released,[]);
    key('keyup','Space');sample=input.sample();assert.equal(sample.jumpReleased,true);assert.equal(sample.jumpHeld,false);
    assert.equal(input.sample().jumpReleased,false);input.dispose();
});

test('clearing inside a command rejects stale repeats until a new physical press',()=>{
    const canvas=new EventTarget(),commands=[];
    const input=new Input(canvas,code=>{commands.push(code);input.clear();},new EventTarget());
    const key=(type,code,repeat=false)=>{
        const event=new Event(type,{cancelable:true});
        Object.defineProperties(event,{code:{value:code},repeat:{value:repeat}});canvas.dispatchEvent(event);
    };
    key('keydown','Space');key('keydown','KeyD');key('keydown','KeyJ');key('keydown','KeyP');
    key('keydown','Space',true);key('keydown','KeyD',true);key('keydown','KeyJ',true);key('keydown','KeyP',true);
    const sample=input.sample();assert.deepEqual(sample.held,[]);assert.deepEqual(sample.pressed,[]);
    assert.deepEqual(commands,['KeyP']);
    key('keyup','Space');key('keydown','Space');assert.equal(input.sample().jump,true);input.dispose();
});
