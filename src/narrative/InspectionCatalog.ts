import { lastPlatformInspections } from './lastPlatformInspections';
import {sluiceExchangeInspections} from './sluiceExchangeInspections';
export interface Inspection { title:string; body:string; action:string; }
export const inspections:Readonly<Record<string,Inspection>>={
    'saved-seat-card': {title:'A saved seat',body:'Two initials have been scratched beneath the seat. Too worn to read. The lamp above it has been repaired more than once.',action:'Leave the seat free'},
    ...lastPlatformInspections,
    ...sluiceExchangeInspections,
    'transfer-record-card':{title:'Transfer ledger',body:'A familiar name appears in a transfer entry. The listed route is S-17. The ledger records a transfer; it does not establish who authorized it, or whether it was voluntary.',action:'Record discovery'},
    'route-key-card':{title:'Route index',body:'S-17 connects to the next destination beyond the platform. The route index identifies a place to investigate, not an explanation of what happened.',action:'Follow this lead'},
    'letter-card':{title:'An unfinished letter',body:'“I kept your seat. I still do.” The rest is unwritten. Someone folded the page carefully before leaving it behind.',action:'Keep letter'},
    'gate-card':{title:'Departure gate',body:'The route is known. Release the local gate mechanism to reach the departure platform.',action:'Open gate'},
    'locked-card':{title:'A lead is missing',body:'The terminal needs a route from the transfer ledger. The departure gate needs a known destination. Explore the Registry or speak with the attendant.',action:'Close'},
};
