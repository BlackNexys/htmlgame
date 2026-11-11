import type {Rect} from '../../interfaces/Geometry';

/** Split exposed top boundaries at real neighboring edges, independent of texture-cell size. */
export function exposedTops(rectangles:readonly Rect[]):Rect[]{
    const runs:Rect[]=[];
    for(const r of rectangles){
        let intervals=[{left:r.x,right:r.x+r.width}];
        for(const other of rectangles){
            if(other===r||Math.abs(other.y+other.height-r.y)>1e-6)continue;
            intervals=intervals.flatMap(i=>other.x>=i.right||other.x+other.width<=i.left?[i]:[
                ...(other.x>i.left?[{left:i.left,right:other.x}]:[]),...(other.x+other.width<i.right?[{left:other.x+other.width,right:i.right}]:[])]);
        }
        for(const i of intervals)runs.push({x:i.left,y:r.y,width:i.right-i.left,height:r.height});
    }
    runs.sort((a,b)=>a.y-b.y||a.x-b.x);const merged:Rect[]=[];
    for(const r of runs){const last=merged.at(-1);if(last&&last.y===r.y&&last.x+last.width===r.x&&last.height===r.height)last.width+=r.width;else merged.push({...r});}
    return merged;
}
