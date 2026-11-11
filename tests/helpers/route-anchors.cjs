require('../register.cjs');
const {compileLevel}=require('../../src/levels/LevelCompiler.ts');
function routeAnchors(document){
    const compiled=compileLevel(document);
    const floor=(id,offset)=>{
        const r=document.terrain.find(r=>r.id===id);if(!r)throw Error(`Missing route structure: ${id}`);
        return {x:r.x+(offset??r.width/2-16),y:r.y};
    };
    const object=(id,offset=10)=>{
        const raw=document.interactables.find(o=>o.id===id||o.effectId===id),r=compiled.interactables.find(o=>o.id===raw?.id),support=compiled.solids.find(s=>s.owner===raw?.mount?.parent);
        if(!r||!support)throw Error(`Missing mounted route object: ${id}`);
        return {x:r.x-offset,y:support.y};
    };
    return {floor,object};
}
module.exports={routeAnchors};
