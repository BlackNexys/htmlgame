require('./register.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {BootFlameRenderer}=require('../src/renderers/BootFlameRenderer.ts');
const {characterAtlas}=require('../src/game/animation/CharacterAtlas.ts');
const {CharacterAnimation}=require('../src/game/animation/CharacterAnimation.ts');
const {World}=require('../src/game/World.ts');
const {tuning:T}=require('../src/game/config.ts');
const actor={grounded:true,crouched:false,vx:480,sprintCharge:1};
const frame={row:6,column:0,anchorX:128,anchorY:240,mirror:false};
function context(){const draws=[];return{draws,globalAlpha:1,save(){},restore(){},drawImage(...args){draws.push(args);}};}

test('boot flames follow both authored soles and grow with earned sprint buildup',()=>{
 const flames=new BootFlameRenderer({}),c=context();flames.update({...actor,vx:350,sprintCharge:.25},T.step,false);flames.draw(c,frame);
 assert.equal(c.draws.length,2);const small=c.draws[0][7];c.draws.length=0;
 flames.update(actor,T.step,false);flames.draw(c,frame);assert.ok(c.draws[0][7]>small);
 const factor=.7,scale=characterAtlas.size/characterAtlas.cell;
 characterAtlas.boots[6][0].forEach((sole,i)=>{
  assert.equal(c.draws[i][5],Math.round((sole.x-128)*scale-30*factor));
  assert.equal(c.draws[i][6],Math.round((sole.y-240)*scale-22*factor));
 });
});

test('idle, walls, crouching, air, death, reset and unavailable optional art emit no boot flames',()=>{
 for(const player of [{...actor,vx:0},{...actor,vx:330},{...actor,sprintCharge:0},{...actor,crouched:true},{...actor,grounded:false}]){
  const flames=new BootFlameRenderer({}),c=context();flames.update(player,.2,false);flames.draw(c,frame);assert.equal(c.draws.length,0);
 }
 const flames=new BootFlameRenderer({}),c=context();flames.update(actor,.2,true);flames.draw(c,frame);assert.equal(c.draws.length,0);
 flames.update(actor,.2,false);flames.reset();flames.draw(c,frame);assert.equal(c.draws.length,0);
 const missing=new BootFlameRenderer();missing.update(actor,.2,false);missing.draw(c,frame);assert.equal(c.draws.length,0);
});

test('the earned sprint selects the authored sprint row, and firing keeps its moving legs',()=>{
 const w=new World({width:10000,height:2400,solids:[{x:0,y:1200,width:10000,height:1200}],spawn:{x:500,y:1148},enemies:[],exit:{x:9800,y:1092,width:64,height:108}}),animation=new CharacterAnimation();
 const input={left:false,right:true,up:false,down:false,jump:false,jumpHeld:false,jumpReleased:false,sprint:true,fire:false};
 for(let i=0;i<100;i++){w.update(T.step,input);animation.update(w.player,T.step);}
 assert.equal(animation.sample(w.player).base.row,6);animation.update(w.player,T.step,['fire']);
 assert.equal(animation.sample(w.player).base.row,6);assert.equal(animation.sample(w.player).upper.row,3);
});
