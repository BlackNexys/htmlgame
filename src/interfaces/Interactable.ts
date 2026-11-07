import type { Rect } from './Geometry';
export type InteractionKind = 'inspect' | 'collect' | 'operate';
export interface InteractableDefinition extends Rect {
    id: string; kind: InteractionKind; label: string; reach: number;
    sceneId: string; effectId?: string; conditionId?: string;
    solid?: boolean;
}
