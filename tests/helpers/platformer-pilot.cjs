const idle={left:false,right:false,jump:false,fire:true};
function pilotInput(p,solids,enemies,point,timer){
    const direction=Math.abs(point.x-p.x)>8?Math.sign(point.x-p.x):0,edge=direction>0?p.x2:p.x;
    const obstacle=direction && solids.some(r=>r.y<p.y2-1 && r.y+r.height>p.y && (direction>0?r.x>=edge-.01&&r.x<edge+85:r.x+r.width<=edge+.01&&r.x+r.width>edge-85));
    const probe=edge+direction*8;
    const gap=direction && !solids.some(r=>Math.abs(r.y-p.y2)<3 && probe>=r.x && probe<=r.x+r.width);
    const foe=enemies.some(e=>e.health>0 && (e.x-p.x)*direction>0 && Math.abs(e.x-p.x)<130 && Math.abs(e.y+e.height-p.y2)<90);
    const jump=direction && (p.grounded && !point.drop && (obstacle || gap&&(point.shaft||point.y<=p.y2+4) || foe) || p.movement.wallSide===direction && p.vy>=0 && point.y<p.y2) && timer.time-timer.lastJump>.3;
    if(jump){timer.lastJump=timer.time;timer.held=.35;}
    return {...idle,left:direction<0,right:direction>0,jump:!!jump,jumpHeld:timer.held>0};
}

module.exports={pilotInput};
