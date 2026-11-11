import type {LevelDocument} from '../levels/LevelDocument';
import type {WaterDefinition} from '../world/water/WaterDefinition';

/** Water-specific properties, kept out of the generic object inspector. */
export class WaterInspector {
    constructor(private readonly form:HTMLFormElement){}
    private field(name:string,labelText:string,value:string|number,optional=false){
        const label=document.createElement('label');label.textContent=labelText;
        const input=document.createElement('input');input.name=name;input.value=String(value);
        input.type=typeof value==='number'?'number':'text';input.step='1';input.required=!optional;label.append(input);this.form.append(label);
    }
    private choice(name:string,labelText:string,values:string[],value:string){
        const label=document.createElement('label');label.textContent=labelText;
        const input=document.createElement('select');input.name=name;input.replaceChildren(...values.map(v=>new Option(v||'(none)',v)));input.value=value;label.append(input);this.form.append(label);
    }
    render(item:WaterDefinition,level:LevelDocument){
        const offset=item.kind==='waterfall'||!!item.mount;
        this.field('x',offset?'Offset X':'X',item.x);this.field('y',offset?'Offset Y':'Y',item.y);
        this.field('width','Width',item.width);this.field('depth','Depth within water pass',item.depth??0);
        const objects=[...level.terrain,...level.decorations,...level.water].filter(e=>e.id!==item.id).map(e=>e.id);
        if(item.kind==='waterfall'){
            this.choice('source','Source object',objects,item.from.parent);this.field('sourceSocket','Source socket',item.from.socket);
            this.choice('receiver','Receiving water',level.water.filter(w=>['river','canal','basin'].includes(w.kind)).map(w=>w.id),item.to);
            this.choice('overRim','Draw over basin rim',['false','true'],String(item.overRim??false));
            this.choice('behindTerrain','Allow a fall behind walkable terrain',['false','true'],String(item.behindTerrain??false));
        }else{
            this.field('height','Height',item.height);
            this.choice('parent','Mount parent',['',...objects],item.mount?.parent??'');this.field('socket','Mount socket',item.mount?.socket??'topLeft');
            if(item.kind==='drain'){
                this.choice('profile','Drain profile',['gutter','collector'],item.profile??'gutter');this.field('outletX','Outlet X within drain (optional)',item.outletX??'',true);
            }else{
                this.choice('waterKind','Water body type',['river','canal','basin'],item.kind);this.field('current','Current speed (optional)',item.current??'',true);
            }
        }
        const note=document.createElement('p');note.className='editor-help';note.textContent=item.kind==='waterfall'?'The fall follows its source socket and receiving surface. Invalid or upward connections leave the level unchanged.':'Water is decorative. Mounted X/Y are local offsets; changing a receiving surface updates its connected falls.';this.form.append(note);
    }
    read(item:WaterDefinition):WaterDefinition{
        const data=new FormData(this.form),text=(name:string)=>String(data.get(name)??'');
        const common={...item,x:Number(data.get('x')),y:Number(data.get('y')),width:Number(data.get('width')),depth:Number(data.get('depth'))};
        if(item.kind==='waterfall')return {...common,kind:'waterfall',from:{parent:text('source'),socket:text('sourceSocket')},to:text('receiver'),overRim:text('overRim')==='true',behindTerrain:text('behindTerrain')==='true'};
        const value={...common,height:Number(data.get('height'))} as Exclude<WaterDefinition,{kind:'waterfall'}>;
        if(text('parent'))value.mount={parent:text('parent'),socket:text('socket')};else delete value.mount;
        if(value.kind==='drain'){
            value.profile=text('profile') as 'gutter'|'collector';if(text('outletX'))value.outletX=Number(text('outletX'));else delete value.outletX;
        }else{
            value.kind=text('waterKind') as 'river'|'canal'|'basin';if(text('current'))value.current=Number(text('current'));else delete value.current;
        }
        return value;
    }
}
