export const waterKinds=['river','canal','basin','drain','waterfall'] as const;
export type WaterKind=typeof waterKinds[number];
export interface WaterEndpoint {parent:string;socket:string;}
interface WaterPlacement {id:string;x:number;y:number;width:number;depth?:number;}
export interface WaterBodyDefinition extends WaterPlacement {
    kind:'river'|'canal'|'basin';height:number;mount?:WaterEndpoint;current?:number;
}
export interface DrainDefinition extends WaterPlacement {
    kind:'drain';height:number;mount?:WaterEndpoint;outletX?:number;profile?:'gutter'|'collector';
}
export interface WaterfallDefinition extends WaterPlacement {
    kind:'waterfall';from:WaterEndpoint;to:string;overRim?:boolean;behindTerrain?:boolean;
}
export type WaterDefinition=WaterBodyDefinition|DrainDefinition|WaterfallDefinition;
