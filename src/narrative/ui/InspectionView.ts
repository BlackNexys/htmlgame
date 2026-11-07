import type { Inspection } from '../InspectionCatalog';
import type { BlButton } from '@blacklight/signal-soul/atoms';
import './narrative.css';
export class InspectionView {
    private readonly root=document.createElement('dialog');
    private readonly events=new AbortController();
    private finished=false;
    constructor(card:Inspection,private readonly end:(completed:boolean)=>void){
        this.root.className='inspection-dialog';this.root.setAttribute('aria-label',card.title);
        this.root.innerHTML=`
            <header class="narrative-heading">
                <div><p class="eyebrow">UNDERWORLD / DISCOVERY</p><h2 tabindex="-1"></h2></div>
                <span class="narrative-sigil" aria-hidden="true">◆</span>
            </header>
            <div class="inspection-record"><p class="inspection-label">A CLOSER LOOK</p><p class="inspection-body"></p></div>
            <footer class="narrative-footer">
                <p class="inspection-note"><kbd>Esc</kbd> Leave without confirming</p>
                <div class="narrative-actions"><bl-button id="inspection-cancel" variant="quiet">Leave</bl-button><bl-button id="inspection-complete" variant="primary"></bl-button></div>
            </footer>`;
        this.root.querySelector('h2')!.textContent=card.title;this.root.querySelector('.inspection-body')!.textContent=card.body;
        this.root.querySelector('#inspection-complete')!.textContent=card.action;
        const options={signal:this.events.signal};
        this.root.querySelector('#inspection-cancel')!.addEventListener('click',()=>this.finish(false),options);
        this.root.querySelector('#inspection-complete')!.addEventListener('click',()=>this.finish(true),options);
        this.root.addEventListener('cancel',event=>{event.preventDefault();this.finish(false);},options);
        document.body.append(this.root);this.root.showModal();
        const button=this.root.querySelector<BlButton>('#inspection-complete')!;
        void button.updateComplete.then(()=>{
            if(this.finished)return;
            const target=this.root.scrollHeight>this.root.clientHeight?this.root.querySelector<HTMLElement>('h2')!:button;
            target.focus({preventScroll:true});this.root.scrollTop=0;
        });
    }
    private finish(completed:boolean){if(this.finished)return;this.dispose();this.end(completed);}
    dispose(){this.finished=true;this.events.abort();this.root.close();this.root.remove();}
}
