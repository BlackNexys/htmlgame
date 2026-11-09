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
import { freshCampaign, stages } from './NarrativeCatalog';
import { campaignStage } from './CampaignStages';
import { studyStory } from './StoryCatalog';
export interface InteractionPlan { scene?:DialogueScene; card?:Inspection; effects:readonly string[]; context:EffectContext; }

/** Interprets story significance without adding story branches to World or actors. */
export class NarrativeSession {
    readonly state:NarrativeState;
    readonly resolver=new SceneResolver();
    readonly objectives=new ObjectiveTracker();
    private readonly effects:EffectApplier;
    constructor(readonly levelId:string,readonly store:SaveStore,readonly preview=false){
        // Layout experiments must never overwrite the player's campaign, even via a bare URL.
        this.preview=preview=preview || levelId==='last-platform-rebuild';
        const save=this.active && !preview?store.load():freshCampaign();
        const stageId=levelId==='last-platform-rebuild'?'last-platform-demo':levelId;
        if(preview && this.definition && !save.unlockedStages.includes(stageId as keyof typeof stages))save.unlockedStages.push(stageId as keyof typeof stages);
        this.state=new NarrativeState(save);this.effects=new EffectApplier(this.state);
    }
    get definition(){return campaignStage(this.levelId);}
    get story(){return this.definition?.story??studyStory;}
    get active(){return !!this.definition;}
    get lead(){return this.objectives.current(this.state,this.story);}
    get allowed(){return !this.active || this.preview || this.state.snapshot().unlockedStages.includes(this.levelId as keyof typeof stages);}
    get nextDestination(){
        const id=this.definition?.next;
        if(!id || !this.state.snapshot().unlockedStages.includes(id))return undefined;
        return {id,title:stages[id],url:campaignStage(id)?`./?level=${id}${this.preview?'&preview=1':''}`:undefined};
    }
    get journal(){
        const save=this.state.snapshot(),known=Object.values(this.story.facts);
        return {facts:save.facts.filter(id=>known.includes(id)),milestones:save.milestones.filter(id=>this.story.milestones.includes(id)),keepsakes:save.keepsakes.filter(id=>this.story.keepsakes.includes(id))};
    }
    enter(){const id=this.definition?.arrivalEffect;if(id)this.commit([id],{source:'stage'});}
    attach(world:World){
        for(const object of world.interactables){
            const effect=object.definition.effectId?effectCatalog[object.definition.effectId]:undefined;
            if(effect?.actions.some(action=>action.type==='keepsake' && this.state.owns(action.id)))object.collected=true;
        }
        world.syncInteractables();
        const definition=this.definition;
        const routeKnown=conditionMet(definition?.exitCondition,this.state);
        const objectOpen=!definition?.exitObject || world.interactables.some(item=>item.id===definition.exitObject && item.operated);
        world.level.exit.enabled=routeKnown && objectOpen;
        world.level.exit.lockedLabel=routeKnown?'RELEASE THE SHUTTER':'FIND A LEAD';
    }
    plan(target:InteractionTarget):InteractionPlan {
        if(target instanceof Interactable){
            const d=target.definition;
            const effect=d.effectId?effectCatalog[d.effectId]:undefined;
            if(!conditionMet(d.conditionId,this.state) || !conditionMet(effect?.condition,this.state))return {card:this.lockedCard,effects:[],context:{source:d.kind,object:target}};
            return {card:inspections[d.sceneId],scene:sceneFor(d.sceneId),effects:d.effectId?[d.effectId]:[],context:{source:d.kind,object:target}};
        }
        const scene=sceneFor(this.resolver.resolve(target.scene,this.state));
        if(scene?.completionEffects.some(id=>Object.hasOwn(effectCatalog,id) && !conditionMet(effectCatalog[id].condition,this.state)))return {card:this.lockedCard,effects:[],context:{source:'npc'}};
        return {scene,effects:scene?.completionEffects.filter(id=>Object.hasOwn(effectCatalog,id))??[],context:{source:'npc'}};
    }
    prompt(target:InteractionTarget|undefined){
        if(target instanceof Interactable && !conditionMet(target.definition.conditionId,this.state))return `F · Inspect locked ${target.displayName}`;
        return undefined;
    }
    complete(plan:InteractionPlan,world:World){this.commit(plan.effects,plan.context);this.attach(world);}
    completeStage(){const id=this.definition?.completionEffect;if(id)this.commit([id],{source:'stage'});}
    private get lockedCard(){return inspections[this.story.lockedCard];}
    reset(){this.state.replace(this.active && !this.preview?this.store.reset():freshCampaign());}
    private commit(ids:readonly string[],context:EffectContext){
        if(!ids.length)return;
        const before=JSON.stringify(this.state.snapshot()),data=this.effects.apply(ids,context);
        if((JSON.stringify(data)!==before || this.store.warning) && this.active && !this.preview)this.store.save(data);
    }
}
