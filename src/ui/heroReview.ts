import { World } from '../game/World';
import { CharacterRenderer } from '../renderers/CharacterRenderer';
import { ProjectileRenderer } from '../renderers/ProjectileRenderer';
import { CharacterAnimation } from '../game/animation/CharacterAnimation';
import { heroMuzzle } from '../game/animation/HeroPose';
import { characterAtlas } from '../game/animation/CharacterAtlas';
import { characterAimAtlas } from '../game/animation/CharacterAimAtlas';
import type { PlayerMotion } from '../game/movement/PlayerMovement';

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const select = (id: string) => element<HTMLSelectElement>(id).value;
const checked = (id: string) => element<HTMLInputElement>(id).checked;
const canvas = element<HTMLCanvasElement>('review'), c = canvas.getContext('2d')!;
const status = element<HTMLOutputElement>('status');
const load = async (file: string) => { const image = new Image(); image.src = './assets/' + file; await image.decode(); return image; };

async function start() {
    const [base,aim,fire,flicker] = await Promise.all([characterAtlas.image,characterAimAtlas.image,'hero/canon-v1/bootfire-v1.png','weapons/flicker/flicker-v1.png'].map(load));
    let world: World, renderer: CharacterRenderer, animation: CharacterAnimation;
    const projectiles = new ProjectileRenderer(c,flicker);
    let time=0, paused=false, facing=1;
    function reset() {
        world=new World({width:100000,height:1000,spawn:{x:1000,y:248},solids:[{x:0,y:300,width:100000,height:100}],enemies:[],exit:{x:99900,y:192,width:64,height:108}});
        renderer=new CharacterRenderer(c,base,aim,fire); animation=new CharacterAnimation(); time=0;
    }
    reset();
    function step(dt: number) {
        time+=dt;
        const p=world.player, sequence: PlayerMotion[]=['idle','running','sprinting','running','crouching','airborne','running','idle'];
        p.motion=select('motion')==='sequence'?sequence[Math.floor(time/1.5)%sequence.length]:select('motion') as PlayerMotion;
        p.height=p.motion==='crouching'?32:52;
        p.grounded=!['airborne','wall-slide'].includes(p.motion); p.y=(p.grounded?300:250)-p.height;
        // Exercise the complete rise/apex/fall range, including the initial jump poses.
        p.vy=p.grounded?0:p.motion==='wall-slide'?160:-700+(time%1.2)/1.2*1550;
        p.movement.sprintCharge=p.motion==='sprinting'?Math.min(1,(select('motion')==='sequence'?time%1.5:time)/.6):0;
        p.vx=(p.motion==='sprinting'?330+150*p.sprintCharge:p.motion==='running'?330:0)*facing;
        p.x+=p.vx*dt; p.facing=facing;
        const [x,y]=select('aim').split(',').map(Number);p.aim={x,y};p.firing=checked('fire');
        world.events=[];world.weaponEvents=[];
        p.weapons.update(dt,p.firing,world,p);
        world.projectiles=world.projectiles.filter(shot=>shot.update(world,dt));
        world.effects.update(dt);world.effects.consume(world.weaponEvents);
        renderer.update(p,dt,world.events,false);animation.update(p,dt,world.events,false);
    }
    function draw() {
        const p=world.player,zoom=Number(select('zoom')),camera=p.x+p.width/2-250/zoom;
        c.setTransform(1,0,0,1,0,0);c.imageSmoothingEnabled=false;c.fillStyle='#172032';c.fillRect(0,0,canvas.width,canvas.height);
        c.save();c.translate(0,canvas.height-80);c.scale(zoom,zoom);c.translate(-camera,-300);
        c.fillStyle='#435165';c.fillRect(camera,300,canvas.width/zoom,2);
        for(let x=Math.floor(camera/48)*48;x<camera+canvas.width/zoom;x+=48){c.fillStyle='#2b3b50';c.fillRect(x,302,1,10);}
        renderer.draw(p,time);projectiles.draw(world.projectiles,world.effects.flicker);
        if(checked('guides')) {
            c.strokeStyle='#6be0ef';c.lineWidth=1/zoom;c.strokeRect(p.x,p.y,p.width,p.height);
            const palm=heroMuzzle(p),length=Math.hypot(p.aim.x,p.aim.y);
            c.fillStyle='#ffffff';c.fillRect(palm.x-1,palm.y-1,2,2);
            c.beginPath();c.moveTo(palm.x,palm.y);c.lineTo(palm.x+p.aim.x/length*70,palm.y+p.aim.y/length*70);c.stroke();
        }
        c.restore();
        const pose=animation.sample(p);
        status.textContent=`${p.motion} · ${Math.abs(p.vx).toFixed(0)} px/s · charge ${p.sprintCharge.toFixed(2)} · frame ${pose.base.column+1} · ${world.projectiles.length} shots\nWhite marker: palm. Cyan: collider and firing direction. Time ${time.toFixed(3)} s.`;
        canvas.dataset.ready='true';canvas.dataset.frame=String(pose.base.column);canvas.dataset.time=String(time);
    }
    element('pause').onclick=()=>{paused=!paused;element('pause').textContent=paused?'Play':'Pause';};
    element('step').onclick=()=>{paused=true;element('pause').textContent='Play';step(1/120);step(1/120);draw();};
    element('reset').onclick=()=>{reset();draw();};
    element('facing').onclick=()=>{facing*=-1;element('facing').textContent=facing===1?'Face left':'Face right';};
    element('motion').onchange=()=>{reset();step(1/120);draw();};
    let last=performance.now(),accumulator=0;
    function tick(now:number){const dt=Math.min(.05,(now-last)/1000);last=now;if(!paused){accumulator+=dt*Number(select('speed'));while(accumulator>=1/120){step(1/120);accumulator-=1/120;}}draw();requestAnimationFrame(tick);}
    requestAnimationFrame(tick);
}
start().catch(error=>{status.textContent=String(error);});
