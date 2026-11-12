import { Particle } from '../../components/Particle';
import type { FlickerEvent, FlickerEffect, FlickerSpark } from '../../interfaces/Weapon';
import { flickerVisuals } from '../animation/FlickerVisuals';
import type { Projectile } from '../../components/Projectile';

export class ParticleSystem {
    particles: Particle[] = [];
    flicker: FlickerEffect[] = [];
    flickerSparks: FlickerSpark[] = [];
    private sparkSequence = 0;
    private readonly trails = new WeakMap<Projectile, {x: number; y: number; remainder: number}>();
    private readonly sparkLimit = 192;

    consume(events: readonly FlickerEvent[]) {
        for (const event of events) {
            this.flicker.push({...event, age: 0});
            const count = event.kind === 'enemy' ? 12 : event.kind === 'ignition' ? 7 : event.kind === 'blocked' ? 8 : 4;
            for (let i=0;i<count;i++) {
                const fan = event.kind === 'ignition' ? (i/(count-1)-.5)*1.4 : i/count*Math.PI*2;
                const angle = event.angle + fan, speed = event.kind === 'terrain' ? 45+i*9 : 85+(i*37)%130;
                this.spark({x:event.x,y:event.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
                    age:0,life:.09+(i%4)*.035,size:i%3===0?2:1,
                    color:event.kind==='blocked'?'#91ecf3':event.kind==='terrain'?'#b51b78':'#ff4eae',
                    gravity:event.kind==='terrain'?100:-30,kind:event.kind});
            }
        }
    }

    /** Distance-spaced motes stay behind actual shots, independent of display frame rate. */
    trail(projectiles: readonly Projectile[], dt: number) {
        for (const shot of projectiles) {
            if (shot.owner !== 'player') continue;
            const x=shot.x+shot.width/2,y=shot.y+shot.height/2;
            const previous=this.trails.get(shot) ?? {x:x-shot.vx*Math.min(dt,shot.age),y:y-shot.vy*Math.min(dt,shot.age),remainder:0};
            const dx=x-previous.x,dy=y-previous.y,distance=Math.hypot(dx,dy);
            if (distance>0) {
                for(let at=10-previous.remainder;at<=distance;at+=10) {
                    const n=this.sparkSequence++,side=n%2?1:-1,unitX=dx/distance,unitY=dy/distance;
                    this.spark({x:previous.x+dx*at/distance,y:previous.y+dy*at/distance,
                        vx:-unitX*35-unitY*side*22,vy:-unitY*35+unitX*side*22-10,
                        age:0,life:.1+(n%3)*.025,size:n%4===0?2:1,color:'#ff4eae',gravity:-20,kind:'trail'});
                }
            }
            this.trails.set(shot,{x,y,remainder:(previous.remainder+distance)%10});
        }
    }

    private spark(spark: FlickerSpark) {
        if (this.flickerSparks.length >= this.sparkLimit) this.flickerSparks.shift();
        this.flickerSparks.push(spark);
    }

    burst(x: number, y: number, color: string, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = i * Math.PI * 2 / count;
            this.particles.push(new Particle({x, y, vx: Math.cos(angle) * 100,
                vy: Math.sin(angle) * 100 - 40, life: .35, color}));
        }
    }

    update(dt: number) {
        this.flickerSparks = this.flickerSparks.filter(spark => {
            spark.age+=dt; spark.x+=spark.vx*dt; spark.y+=spark.vy*dt; spark.vy+=spark.gravity*dt;
            const drag=Math.exp(-7*dt);spark.vx*=drag;spark.vy*=drag;
            return spark.age<spark.life;
        });
        this.particles = this.particles.filter(particle => particle.update(dt));
        this.flicker = this.flicker.filter(effect => {
            effect.age += dt; return effect.age < flickerVisuals.effects[effect.kind].duration;
        });
    }
}
