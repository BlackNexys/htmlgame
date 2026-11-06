require('./register.cjs');
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {GamePreferences} = require('../src/ui/GamePreferences.ts');

test('game options survive reloads without exposing mutable preference state', () => {
    const values = new Map();
    const storage = {getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value)};
    const preferences = new GamePreferences(storage);
    assert.deepEqual(preferences.value, {muted: false, showHints: true, menuMotion: 'system'});
    preferences.update({muted: true, showHints: false, menuMotion: 'animated'});
    const snapshot = preferences.value; snapshot.muted = false;
    assert.equal(preferences.value.muted, true);
    assert.deepEqual(new GamePreferences(storage).value, {muted: true, showHints: false, menuMotion: 'animated'});
});

test('corrupt or unavailable preference storage leaves options usable', () => {
    const corrupted = new GamePreferences({getItem: () => '{broken', setItem: () => {}});
    assert.deepEqual(corrupted.value, {muted: false, showHints: true, menuMotion: 'system'});
    const invalid = new GamePreferences({getItem: () => '{"muted":"yes","showHints":3,"menuMotion":"invalid"}', setItem: () => {}});
    assert.deepEqual(invalid.value, {muted: false, showHints: true, menuMotion: 'system'});
    const unavailable = new GamePreferences({getItem: () => {throw new Error('Blocked');}, setItem: () => {throw new Error('Full');}});
    assert.deepEqual(unavailable.update({muted: true}), {muted: true, showHints: true, menuMotion: 'system'});
});
