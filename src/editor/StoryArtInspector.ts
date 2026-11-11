import {sceneArt} from '../world/props/SceneArtCatalog';
import type {InteractableDefinition} from '../interfaces/Interactable';
export class StoryArtInspector {
    constructor(private readonly form:HTMLFormElement){}
    render(p:InteractableDefinition){
        for(const [name,title,values,value] of [['visualAsset','Visual asset',['',...Object.keys(sceneArt)],p.visual?.asset??''],['openAsset','Operated visual',['',...Object.keys(sceneArt)],p.visual?.openAsset??'']] as const){
            const l=document.createElement('label');l.textContent=title;const select=document.createElement('select');select.name=name;select.replaceChildren(...values.map(v=>new Option(v||'(none)',v)));select.value=value;l.append(select);this.form.append(l);
        }
        for(const [name,title,value] of [['parent','Mount parent ID',p.mount?.parent??''],['socket','Mount socket',p.mount?.socket??'topLeft'],['visualX','Visual offset X',p.visual?.x??0],['visualY','Visual offset Y',p.visual?.y??0],['visualWidth','Visual width',p.visual?.width??p.width],['visualHeight','Visual height',p.visual?.height??p.height]] as const){
            const l=document.createElement('label');l.textContent=title;const input=document.createElement('input');input.name=name;input.value=String(value);input.type=typeof value==='number'?'number':'text';input.step='1';l.append(input);this.form.append(l);
        }
    }
    read(p:InteractableDefinition){
        const d=new FormData(this.form),parent=String(d.get('parent')).trim(),asset=String(d.get('visualAsset')),result={...p};
        if(parent)result.mount={parent,socket:String(d.get('socket'))};else delete result.mount;
        if(asset){result.visual={asset,x:Number(d.get('visualX')),y:Number(d.get('visualY')),width:Number(d.get('visualWidth')),height:Number(d.get('visualHeight'))};if(d.get('openAsset'))result.visual.openAsset=String(d.get('openAsset'));}else delete result.visual;
        return result;
    }
}
