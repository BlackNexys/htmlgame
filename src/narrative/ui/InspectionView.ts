import type { Inspection } from '../InspectionCatalog';
import type { BlButton } from '@blacklight/signal-soul/atoms';
import './narrative.css';
export class InspectionView {
    private readonly root=document.createElement('dialog');
    private readonly events=new AbortController();
    private finished=false;
    constructor(card:Inspection,private readonly end:(completed:boolean)=>void){
        this.root.className='inspection-dialog';this.root.setAttribute('aria-label',card.title);
        this.root.innerHTML='<p class="eyebrow">UNDERWORLD / DISCOVERY</p><h2></h2><p class="inspection-body"></p><p class="inspection-note">Prototype material · observation is not proof of motive.</p><div><bl-button id="inspection-cancel" variant="quiet">Leave</bl-button><bl-button id="inspection-complete" variant="primary"></bl-button></div>';
        this.root.querySelector('h2')!.textContent=card.title;this.root.querySelector('.inspection-body')!.textContent=card.body;
        this.root.querySelector('#inspection-complete')!.textContent=card.action;
        const options={signal:this.events.signal};
        this.root.querySelector('#inspection-cancel')!.addEventListener('click',()=>this.finish(false),options);
        this.root.querySelector('#inspection-complete')!.addEventListener('click',()=>this.finish(true),options);
        this.root.addEventListener('cancel',event=>{event.preventDefault();this.finish(false);},options);
        document.body.append(this.root);this.root.showModal();
        const button=this.root.querySelector<BlButton>('#inspection-complete')!;
        void button.updateComplete.then(()=>{if(!this.finished)button.focus({preventScroll:true});});
    }
    private finish(completed:boolean){if(this.finished)return;this.dispose();this.end(completed);}
    dispose(){this.finished=true;this.events.abort();this.root.close();this.root.remove();}
}
