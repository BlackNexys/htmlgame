export interface EnvironmentImages {
    terrain?: HTMLImageElement;
    terrainBaselines?:number[];
    water?:HTMLImageElement;
    buildingWalls?:HTMLImageElement;
    buildingTrims?:HTMLImageElement;
    buildingFrames?:Record<string,SpriteFrame>;
    facades?: HTMLImageElement;
    props?: HTMLImageElement;
    city?: HTMLImageElement;
    landmarks?: HTMLImageElement;
    landmarkFrames?:Record<string,SpriteFrame>;
    canopy?:HTMLImageElement;
    architecture?: HTMLImageElement;
    architectureFrames?: Record<string,SpriteFrame>;
    frames?: Record<string,SpriteFrame>;
}
export interface SpriteFrame { x:number; y:number; width:number; height:number; }
export interface EnvironmentAtlas {
    version:1;
    frames:Record<string,SpriteFrame>;
}
