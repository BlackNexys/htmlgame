require('./register.cjs');
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {MenuMusic} = require('../src/game/audio/MenuMusic.ts');
const flush = () => new Promise(resolve => setImmediate(resolve));
function setup(play) {
    const page = new EventTarget(), host = new EventTarget(); page.hidden = false;
    const audio = {paused: true, muted: false, currentTime: 23, plays: 0, loads: 0, src: 'track.mp3',
        play() { this.plays++; return play ? play(this) : (this.paused = false, Promise.resolve()); },
        pause() { this.paused = true; }, removeAttribute() { this.src = ''; }, load() { this.loads++; }};
    return {audio, page, host, music: new MenuMusic(audio, page, host)};
}

test('blocked music retries on interaction, follows mute and title state, and disposes its listeners', async () => {
    let blocked = true;
    const {audio, page, host, music} = setup(audio => {
        if (blocked) return Promise.reject(new Error('Autoplay blocked'));
        audio.paused = false; return Promise.resolve();
    });
    music.update(true, false); await flush(); assert.equal(audio.paused, true);
    blocked = false; page.dispatchEvent(new Event('click')); await flush();
    assert.equal(audio.paused, false); assert.equal(audio.loop, true); assert.equal(audio.volume, .35);
    music.update(true, true); page.dispatchEvent(new Event('keyup')); assert.equal(audio.paused, true); assert.equal(audio.muted, true);
    music.update(true, false); await flush(); assert.equal(audio.paused, false); assert.equal(audio.currentTime, 23);
    music.update(false, false); page.dispatchEvent(new Event('click')); assert.equal(audio.paused, true);
    music.update(true, false); await flush(); assert.equal(audio.paused, false);
    music.dispose(); const plays = audio.plays;
    page.dispatchEvent(new Event('click')); page.dispatchEvent(new Event('keyup')); host.dispatchEvent(new Event('focus'));
    music.update(true, false); assert.equal(audio.plays, plays); assert.equal(audio.paused, true);
    assert.equal(audio.src, ''); assert.equal(audio.loads, 1);
});

test('music stays silent when muted initially, hidden, or unfocused and resumes only on an active title', async () => {
    const {audio, page, host, music} = setup();
    music.update(true, true); page.dispatchEvent(new Event('click')); assert.equal(audio.plays, 0);
    music.update(true, false); await flush(); assert.equal(audio.paused, false);
    page.hidden = true; page.dispatchEvent(new Event('visibilitychange')); assert.equal(audio.paused, true);
    page.hidden = false; page.dispatchEvent(new Event('visibilitychange')); await flush(); assert.equal(audio.paused, false);
    host.dispatchEvent(new Event('blur')); assert.equal(audio.paused, true);
    host.dispatchEvent(new Event('focus')); await flush(); assert.equal(audio.paused, false);
    music.update(false, false); host.dispatchEvent(new Event('focus')); assert.equal(audio.paused, true);
    music.dispose();
});

test('pending playback is coalesced and cannot restart music after leaving the title', async () => {
    const attempts = [];
    const {audio, page, music} = setup(audio => new Promise(resolve => attempts.push(() => {audio.paused = false; resolve();})));
    music.update(true, false); page.dispatchEvent(new Event('click')); music.update(true, false);
    assert.equal(audio.plays, 1);
    music.update(false, false); attempts.shift()(); await flush(); assert.equal(audio.paused, true);
    // A new title visit must not be held up by an obsolete play request.
    music.update(true, false); music.update(false, false); music.update(true, false);
    assert.equal(audio.plays, 3); attempts.shift()(); await flush(); attempts.shift()(); await flush();
    assert.equal(audio.paused, false); music.dispose();
});
