import type { NarrativeSession } from '../NarrativeSession';
import { facts,keepsakes,stages,milestones } from '../NarrativeCatalog';
import type { BlButton } from '@blacklight/signal-soul/atoms';
export class JourneyPanel {
    private readonly root=document.createElement('dialog');
    private readonly events=new AbortController();
    private end?: (reset:boolean)=>void;
    constructor(){
        this.root.className='journey-dialog';this.root.setAttribute('aria-label','Journey');
        this.root.innerHTML='<p class="eyebrow">A PERSONAL JOURNEY</p><h2>Current lead</h2><p class="journey-lead"></p><h3>What you know</h3><ul class="journey-facts"></ul><h3>Milestones</h3><ul class="journey-milestones"></ul><h3>Keepsakes · optional</h3><ul class="journey-keepsakes"></ul><p class="journey-next"></p><p class="journey-save-note">Discoveries save immediately and survive death and stage restart. Temporary level changes reset.</p><p class="journey-warning" role="status"></p><div><bl-button id="journey-reset" variant="quiet">Reset prototype journey</bl-button><bl-button id="journey-close" variant="primary">Back to game</bl-button></div>';
        const options={signal:this.events.signal};
        this.root.querySelector('#journey-close')!.addEventListener('click',()=>this.finish(false),options);
        this.root.querySelector('#journey-reset')!.addEventListener('click',()=>{if(confirm('Clear this prototype’s saved discoveries, Keepsakes and stage progress? This does not reset sound or other game preferences.'))this.finish(true);},options);
        this.root.addEventListener('cancel',event=>{event.preventDefault();this.finish(false);},options);document.body.append(this.root);
    }
    open(session:NarrativeSession,end:(reset:boolean)=>void){
        this.end=end;const save=session.state.snapshot();
        this.root.querySelector('.journey-lead')!.textContent=session.lead;
        const list=(selector:string,values:string[])=>{const root=this.root.querySelector(selector)!;root.replaceChildren();for(const text of values.length?values:['Nothing recorded yet.']){const li=document.createElement('li');li.textContent=text;root.append(li);}};
        list('.journey-facts',save.facts.map(id=>facts[id]));list('.journey-keepsakes',save.keepsakes.map(id=>keepsakes[id]));list('.journey-milestones',save.milestones.map(id=>milestones[id]));
        const next=this.root.querySelector('.journey-next')!;next.replaceChildren();
        if(save.unlockedStages.includes('departure-study')){
            if(session.store.warning)next.textContent='The next destination is unlocked in memory. Save successfully before changing stages.';
            else{const a=document.createElement('a');a.href=`./?level=departure-study${session.preview?'&preview=1':''}`;a.textContent=`Continue: ${stages['departure-study']}`;next.append(a);}
        }
        this.root.querySelector('.journey-warning')!.textContent=session.store.warning;
        this.root.querySelector('.journey-save-note')!.textContent=session.preview?'Workshop playtest: discoveries stay in this preview and never change the saved journey.':'Discoveries save immediately and survive death and stage restart. Temporary level changes reset.';
        this.root.showModal();const button=this.root.querySelector<BlButton>('#journey-close')!;void button.updateComplete.then(()=>{if(this.root.open)button.focus({preventScroll:true});});
    }
    private finish(reset:boolean){this.root.close();const end=this.end;this.end=undefined;end?.(reset);}
    dispose(){this.end=undefined;this.events.abort();this.root.close();this.root.remove();}
}
