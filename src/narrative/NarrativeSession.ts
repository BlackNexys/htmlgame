import { NarrativeState } from './NarrativeState';
import { SaveStore } from './SaveStore';
import { EffectApplier, effectCatalog, type EffectContext } from './EffectApplier';
import { SceneResolver } from './SceneResolver';
import { ObjectiveTracker } from './ObjectiveTracker';
import { conditionMet } from './Conditions';
import { inspections, type Inspection } from './InspectionCatalog';
import { sceneFor } from '../dialogue/SceneCatalog';
import type { DialogueScene } from '../dialogue/DialogueScene';
import type { World } from '../game/World';
import { Interactable } from '../components/Interactable';
import type { InteractionTarget } from '../game/systems/InteractionSystem';
import { freshCampaign } from './NarrativeCatalog';
export interface InteractionPlan { scene?:DialogueScene; card?:Inspection; effects:readonly string[]; context:EffectContext; }

/** Interprets story significance without adding story branches to World or actors. */
export class NarrativeSession {
    readonly state:NarrativeState;
    readonly resolver=new SceneResolver();
    readonly objectives=new ObjectiveTracker();
    private readonly effects:EffectApplier;
    constructor(readonly levelId:string,readonly store:SaveStore,readonly preview=false){
        const save=this.active && !preview?store.load():freshCampaign();
        if(preview && levelId==='departure-study')save.unlockedStages.push('departure-study');
        this.state=new NarrativeState(save);this.effects=new EffectApplier(this.state);
    }
    get active(){return ['narrative-study','departure-study'].includes(this.levelId);}
    get lead(){return this.objectives.current(this.state);}
    get allowed(){return this.preview || this.levelId!=='departure-study' || this.state.snapshot().unlockedStages.includes('departure-study');}
    enter(){if(this.levelId==='narrative-study')this.commit(['arrive-station'],{source:'stage'});}
    attach(world:World){
        for(const object of world.interactables){
            const effect=object.definition.effectId?effectCatalog[object.definition.effectId]:undefined;
            if(effect?.actions.some(action=>action.type==='keepsake' && this.state.owns(action.id)))object.collected=true;
        }
        world.syncInteractables();
        world.level.exit.enabled=this.levelId!=='narrative-study' || this.state.has('learned-next-destination');
    }
    plan(target:InteractionTarget):InteractionPlan {
        if(target instanceof Interactable){
            const d=target.definition;
            const effect=d.effectId?effectCatalog[d.effectId]:undefined;
            if(!conditionMet(d.conditionId,this.state) || !conditionMet(effect?.condition,this.state))return {card:inspections['locked-card'],effects:[],context:{source:d.kind,object:target}};
            return {card:inspections[d.sceneId],scene:sceneFor(d.sceneId),effects:d.effectId?[d.effectId]:[],context:{source:d.kind,object:target}};
        }
        const scene=sceneFor(this.resolver.resolve(target.scene,this.state));
        if(scene?.completionEffects.some(id=>Object.hasOwn(effectCatalog,id) && !conditionMet(effectCatalog[id].condition,this.state)))return {card:inspections['locked-card'],effects:[],context:{source:'npc'}};
        return {scene,effects:scene?.completionEffects.filter(id=>Object.hasOwn(effectCatalog,id))??[],context:{source:'npc'}};
    }
    prompt(target:InteractionTarget|undefined){
        if(target instanceof Interactable && !conditionMet(target.definition.conditionId,this.state))return `F · Inspect locked ${target.displayName}`;
        return undefined;
    }
    complete(plan:InteractionPlan,world:World){this.commit(plan.effects,plan.context);this.attach(world);}
    completeStage(){if(this.levelId==='narrative-study')this.commit(['complete-opening'],{source:'stage'});else if(this.levelId==='departure-study')this.commit(['complete-departure'],{source:'stage'});}
    reset(){this.state.replace(this.active && !this.preview?this.store.reset():freshCampaign());}
    private commit(ids:readonly string[],context:EffectContext){
        if(!ids.length)return;
        const before=JSON.stringify(this.state.snapshot()),data=this.effects.apply(ids,context);
        if((JSON.stringify(data)!==before || this.store.warning) && this.active && !this.preview)this.store.save(data);
    }
}
