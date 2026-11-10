import type {PropDefinition} from './PropDefinition';
import type {InteractableDefinition} from '../../interfaces/Interactable';
export function sceneAssetKeys(scene:{props?:readonly PropDefinition[];interactables?:readonly InteractableDefinition[]}){
    return [...new Set([...(scene.props??[]).map(p=>p.asset),...(scene.interactables??[]).flatMap(o=>o.visual?[o.visual.asset,...(o.visual.openAsset?[o.visual.openAsset]:[])]:[])])];
}
