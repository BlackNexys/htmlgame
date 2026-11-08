import type { CampaignSave, Fact, Keepsake, Milestone, Stage } from './NarrativeCatalog';
import type { NarrativeState } from './NarrativeState';
import type { Interactable } from '../components/Interactable';
import { conditionMet } from './Conditions';
import { parseCampaign } from './SaveStore';
import { lastPlatformEffects } from './lastPlatformEffects';

type Action = {type:'fact';id:Fact} | {type:'keepsake';id:Keepsake} | {type:'milestone';id:Milestone} |
    {type:'unlock-stage'|'complete-stage';id:Stage} | {type:'object';state:'collected'|'operated'};
export interface Effect { source:'npc'|'inspect'|'collect'|'operate'|'stage'; scene?:string; condition?:string; actions:readonly Action[]; }
export const effectCatalog: Readonly<Record<string,Effect>> = {
    'arrive-station': {source:'stage',actions:[{type:'fact',id:'arrived-at-last-platform'}]},
    'attendant-introduction': {source:'npc',actions:[{type:'fact',id:'met-rail-attendant'},{type:'fact',id:'learned-about-registry'}]},
    'attendant-record': {source:'npc',condition:'has-record',actions:[{type:'fact',id:'met-rail-attendant'},{type:'fact',id:'learned-next-destination'},{type:'milestone',id:'registry-investigated'}]},
    'inspect-transfer-record': {source:'inspect',scene:'transfer-record-card',actions:[{type:'fact',id:'found-transfer-record'}]},
    'decode-route': {source:'inspect',scene:'route-key-card',condition:'has-record',actions:[{type:'fact',id:'learned-next-destination'},{type:'milestone',id:'registry-investigated'}]},
    'collect-letter': {source:'collect',scene:'letter-card',actions:[{type:'keepsake',id:'lost-letter'},{type:'object',state:'collected'}]},
    'open-gate': {source:'operate',scene:'gate-card',condition:'knows-destination',actions:[{type:'object',state:'operated'}]},
    'complete-opening': {source:'stage',condition:'knows-destination',actions:[{type:'complete-stage',id:'narrative-study'},{type:'unlock-stage',id:'departure-study'}]},
    'complete-departure': {source:'stage',actions:[{type:'complete-stage',id:'departure-study'}]},
    ...lastPlatformEffects,
};
export interface EffectContext { source:Effect['source']; object?:Interactable; }

/** Validate a whole completion batch before committing knowledge or touching objects. */
export class EffectApplier {
    constructor(private readonly state:NarrativeState) {}
    apply(ids:readonly string[], context:EffectContext):CampaignSave {
        const draft=this.state.snapshot(), operations:{object:Interactable;state:'collected'|'operated'}[]=[];
        const add=(field:'facts'|'keepsakes'|'milestones'|'unlockedStages'|'completedStages',id:string)=>{
            const list=draft[field] as string[];if(!list.includes(id))list.push(id);
        };
        for(const id of ids){
            const effect=Object.hasOwn(effectCatalog,id)?effectCatalog[id]:undefined;
            if(!effect || effect.source!==context.source || !conditionMet(effect.condition,this.state))throw Error('Interaction effect is not eligible');
            if(effect.scene && (context.object?.definition.sceneId!==effect.scene || context.object.definition.kind!==context.source))throw Error('Evidence must come from its physical source');
            for(const action of effect.actions){
                if(action.type==='object'){
                    if(!context.object || context.object.definition.kind!==context.source)throw Error('Missing interaction object');
                    operations.push({object:context.object,state:action.state});
                }else add(action.type==='fact'?'facts':action.type==='keepsake'?'keepsakes':action.type==='milestone'?'milestones':action.type==='unlock-stage'?'unlockedStages':'completedStages',action.id);
            }
        }
        const validated=parseCampaign(draft);
        this.state.replace(validated);
        operations.forEach(({object,state})=>{object[state]=true;});
        return validated;
    }
}
