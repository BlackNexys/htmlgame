/** Background shells only: collision and story anchors belong to the level. */
export const buildingFamilies=['station','residential','registry','archive'] as const;
export const buildingTrimNames=buildingFamilies.flatMap(name=>['left','right','band','roof'].map(part=>name+'-'+part));
export interface BuildingShell {group:string;material:number;x:number;y:number;width:number;height:number;light:number;floors:readonly number[];pier?:boolean;}
const shell=(group:string,material:number,x:number,y:number,width:number,height:number,floors:readonly number[],light=.52,pier=false):BuildingShell=>({group,material,x,y,width,height,floors,light,pier});
export const buildingShells:readonly BuildingShell[]=[
    shell('station',0,0,288,768,576,[576,864]),
    shell('station',0,768,672,960,192,[864]),
    shell('station',0,0,1248,2496,384,[1632]),
    ...[0,672,1440].map(x=>shell('station',0,x,864,96,384,[],.45,true)),
    ...[0,672,1248].map(x=>shell('station',0,x,1632,48,960,[],.32,true)),
    shell('registry',2,4800,864,1536,768,[1248,1632]),
    shell('registry',2,6336,1248,528,384,[1632]),
    ...[4800,5280].map(x=>shell('registry',2,x,1632,96,2016,[],.3,true)),
    shell('registry',2,6240,1632,96,1248,[],.3,true),
    shell('west',1,0,2208,1296,960,[2592,2784,3168]),
    shell('west',1,1296,2784,96,384,[3168]),
    shell('freight',3,2112,2208,2688,192,[2400],.46),
    shell('archive',3,5760,2496,576,384,[2880],.48),
    shell('departure',3,6144,2976,1056,384,[3360],.5),
];
export function insideBuilding(group:string,x:number,y:number,shells:readonly BuildingShell[]=buildingShells){
    return shells.some(b=>b.group===group&&x>=b.x&&x<b.x+b.width&&y>=b.y&&y<b.y+b.height);
}
/** World-aligned courses stay aligned where two wings meet. */
export function buildingTile(material:number,x:number,y:number){
    const col=Math.floor(x/96),row=Math.floor(y/96);
    return material*4+((Math.imul(col,13)^Math.imul(row,7))>>>0)%4;
}
