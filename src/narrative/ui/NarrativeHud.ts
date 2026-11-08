import type { NarrativeSession } from '../NarrativeSession';
import './narrative.css';
export class NarrativeHud {
    private readonly button=document.createElement('bl-button');
    private readonly notice=document.createElement('p');
    private readonly warning=document.createElement('p');
    private readonly outcomeWarning=document.createElement('p');
    private readonly next=document.createElement('a');
    private lead='';
    private timer?:number;
    constructor(open:()=>void){
        this.button.textContent='Journey · K';this.button.variant='quiet';this.button.hidden=true;
        this.button.addEventListener('pointerdown',event=>event.preventDefault());this.button.onclick=open;
        document.querySelector('.toolbar-actions')!.prepend(this.button);
        this.notice.className='lead-notice';this.notice.setAttribute('role','status');this.notice.hidden=true;
        this.notice.innerHTML='<span class="lead-notice-label">Current lead</span><span class="lead-notice-copy"></span>';
        this.warning.className='save-warning';this.warning.setAttribute('role','alert');this.warning.hidden=true;
        document.querySelector('#game-hud')!.append(this.notice,this.warning);
        this.next.className='journey-next-stage';this.next.textContent='Continue along the next line →';this.next.hidden=true;document.querySelector('#session-menu')!.append(this.next);
        this.outcomeWarning.className='journey-warning';this.outcomeWarning.setAttribute('role','alert');this.outcomeWarning.hidden=true;document.querySelector('#session-menu')!.append(this.outcomeWarning);
    }
    update(session:NarrativeSession|undefined){
        this.button.hidden=!session?.active;
        const destination=session?.nextDestination;
        this.next.hidden=!(session?.active && !session.store.warning && destination?.url);
        this.next.href=destination?.url??'#';
        if(!session?.active)return;
        if(session.lead!==this.lead){this.lead=session.lead;this.notice.querySelector('.lead-notice-copy')!.textContent=this.lead;this.notice.hidden=false;if(this.timer)clearTimeout(this.timer);this.timer=window.setTimeout(()=>{this.notice.hidden=true;},6000);}
        this.warning.hidden=!session.store.warning;if(this.warning.textContent!==session.store.warning)this.warning.textContent=session.store.warning;
        this.outcomeWarning.hidden=!session.store.warning;if(this.outcomeWarning.textContent!==session.store.warning)this.outcomeWarning.textContent=session.store.warning;
    }
    dispose(){if(this.timer)clearTimeout(this.timer);this.button.onclick=null;this.button.remove();this.notice.remove();this.warning.remove();this.outcomeWarning.remove();this.next.remove();}
}
