import type {Rect} from '../../interfaces/Geometry';
import type {StructureDefinition} from '../structures/StructureDefinition';
export interface PropDefinition extends Rect {
    id:string;asset:string;mount?:StructureDefinition['mount'];
    layer?:'rear'|'foreground';depth?:number;
    light?:number;opacity?:number;flip?:boolean;stretch?:boolean;
}
export interface VisualDefinition extends Rect {asset:string;openAsset?:string;}
export interface PresentationDefinition {environment:'confluence';scenery:'assemblies'|'authored'|'construction';}
