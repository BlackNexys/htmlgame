import {sceneArt} from '../world/props/SceneArtCatalog';
import type {PropDefinition} from '../world/props/PropDefinition';
export class PropInspector {
    constructor(private readonly form:HTMLFormElement){}
    render(p:PropDefinition){
        const choice=(name:string,label:string,values:string[],value:string)=>{const l=document.createElement('label');l.textContent=label;const s=document.createElement('select');s.name=name;s.replaceChildren(...values.map(v=>new Option(v,v)));s.value=value;l.append(s);this.form.append(l);};
        choice('asset','Catalog asset',Object.keys(sceneArt),p.asset);
        for(const [name,label,value] of [['x','X / local offset',p.x],['y','Y / local offset',p.y],['width','Display width',p.width],['height','Display height',p.height],['depth','Depth',p.depth??0],['light','Light percent',p.light??100],['opacity','Opacity percent',p.opacity??100],['parent','Mount parent ID',p.mount?.parent??''],['socket','Mount socket',p.mount?.socket??'topLeft']] as const){
            const l=document.createElement('label');l.textContent=label;const input=document.createElement('input');input.name=name;input.value=String(value);input.type=typeof value==='number'?'number':'text';input.step='1';input.required=name!=='parent';l.append(input);this.form.append(l);
        }
        choice('layer','Draw layer',['rear','foreground'],p.layer??'rear');
        choice('flip','Mirror horizontally',['false','true'],String(p.flip??false));
        choice('stretch','Sizing override',['catalog','true','false'],p.stretch===undefined?'catalog':String(p.stretch));
    }
    read(p:PropDefinition):PropDefinition{
        const d=new FormData(this.form),parent=String(d.get('parent')).trim(),result:PropDefinition={...p,id:p.id,asset:String(d.get('asset')),x:Number(d.get('x')),y:Number(d.get('y')),width:Number(d.get('width')),height:Number(d.get('height')),layer:d.get('layer') as 'rear'|'foreground',depth:Number(d.get('depth')),light:Number(d.get('light')),opacity:Number(d.get('opacity')),flip:d.get('flip')==='true'};
        if(parent)result.mount={parent,socket:String(d.get('socket'))};else delete result.mount;
        if(d.get('stretch')==='catalog')delete result.stretch;else result.stretch=d.get('stretch')==='true';return result;
    }
}
