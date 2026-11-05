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
