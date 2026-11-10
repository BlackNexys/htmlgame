import placements from './confluence-presentation.json';
import type {LevelDocument} from '../LevelDocument';
import type {PropDefinition} from '../../world/props/PropDefinition';
import {confluenceMaterial} from '../../environment/ConfluenceMaterials';
import {objectArt} from '../../environment/ConfluenceScene';
/** Bounded v1 conversion only. New level identity never selects art or placement. */
export function legacyPresentation(d:LevelDocument){
    if(d.id!=='last-platform-demo')return;
    d.presentation={environment:'confluence',scenery:'authored'};
    d.props=structuredClone(placements).filter(p=>p.x>=0&&p.y>=0&&p.x+p.width<=d.width&&p.y+p.height<=d.height) as PropDefinition[];
    for(const r of [...d.terrain,...d.decorations])r.material=confluenceMaterial(r.x,r.y);
    for(const o of d.interactables){
        const a=objectArt[o.id];if(!a)continue;const gate=a.sprite==='shutterClosed',w=gate?o.width:a.width,h=gate?o.height:a.height;
        const visual={asset:'confluence-'+a.sprite.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),x:Math.round((o.width-w)/2),y:a.bottom-o.y-h,width:w,height:h,...(gate?{openAsset:'confluence-shutter-open'}:{})};
        if(o.y+visual.y>=0&&a.bottom<=d.height)o.visual=visual;
    }
}
