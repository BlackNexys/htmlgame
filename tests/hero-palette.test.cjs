require('./register.cjs');
const {test}=require('node:test');const assert=require('node:assert/strict');
const {heroColor,heroPalette}=require('../src/renderers/HeroPalette.ts');
const hex=color=>'#'+color.map(c=>c.toString(16).padStart(2,'0')).join('');
test('shared material palette separates cloth from head fire without muting the vial or bone',()=>{
    assert.ok(heroPalette.fire.includes(hex(heroColor(210,30,135,true))));
    assert.ok(heroPalette.cloth.includes(hex(heroColor(150,40,90,false))));
    assert.ok(heroPalette.leather.includes(hex(heroColor(60,55,65,false))));
    assert.ok(heroPalette.bone.includes(hex(heroColor(225,205,185,false))));
    assert.ok(heroPalette.vial.includes(hex(heroColor(40,210,230,false))));
    assert.notDeepEqual(heroColor(150,40,90,true),heroColor(150,40,90,false));
});
