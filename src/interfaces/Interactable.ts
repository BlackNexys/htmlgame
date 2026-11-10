import type { Rect } from './Geometry';
import type {StructureDefinition} from '../world/structures/StructureDefinition';
import type {VisualDefinition} from '../world/props/PropDefinition';
export type InteractionKind = 'inspect' | 'collect' | 'operate';
export interface InteractableDefinition extends Rect {
    id: string; kind: InteractionKind; label: string; reach: number;
    sceneId: string; effectId?: string; conditionId?: string;
    solid?: boolean;
    mount?:StructureDefinition['mount'];
    visual?:VisualDefinition;
}
