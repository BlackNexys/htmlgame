import type {World} from '../World';
import type {GameMode} from '../../interfaces/Game';
export function worldSnapshot(world:World,mode:GameMode,includeProps=true){
    const rect=(r:{x:number;y:number;width:number;height:number})=>({x:r.x,y:r.y,width:r.width,height:r.height,x2:r.x+r.width,y2:r.y+r.height});
    const p=world.player;
    return {level:{id:world.level.id,revision:world.level.revision},mode,state:world.state,time:world.elapsed,
        player:{...rect(p),vx:p.vx,vy:p.vy,facing:p.facing,grounded:p.grounded,health:p.health,movement:{wallSide:p.movement.wallSide}},
        enemies:world.enemies.map(e=>({...rect(e),id:e.id,kind:e.kind,health:e.health,state:e.state})),
        collision:world.level.solids.map(r=>({...rect(r),id:r.id,owner:r.owner,collision:r.collision})),
        camera:rect(world.camera),exit:{...rect(world.level.exit),enabled:world.level.exit.enabled},
        props:includeProps?world.level.props.map(p=>({...rect(p),id:p.id,asset:p.definition.asset,layer:p.definition.layer??'rear'})):[],
        interactions:world.interactables.map(o=>({...rect(o),id:o.id,active:o.active,operated:o.operated,collected:o.collected,...(o.definition.visual?{visual:{...o.definition.visual,x:o.x+o.definition.visual.x,y:o.y+o.definition.visual.y}}:{})})),
    };
}
