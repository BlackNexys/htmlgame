import type {Rect} from '../../interfaces/Geometry';
export const structureKinds=['wall','platform','bridge','doorway','outfall','railing'] as const;
export type StructureKind=typeof structureKinds[number];
export interface StructureDefinition extends Rect {
    id:string;kind?:StructureKind;material?:number;
    mount?:{parent:string;socket:string};
    thickness?:number;
    layer?:'rear'|'foreground';
    depth?:number;
}
