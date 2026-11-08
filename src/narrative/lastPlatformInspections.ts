import type { Inspection } from './InspectionCatalog';

/** Candidate writing from the supplied level brief; no final names or motives established. */
export const lastPlatformInspections: Readonly<Record<string,Inspection>> = {
    'platform-ledger-card': {
        title:'Arrivals / Transfer ledger',
        body:'The name is there. Her name.\n\nROUTE: S-17\nTRANSFER: RECORDED\nAUTHORIZATION: REDACTED\n\nThe entry confirms a transfer. It does not establish who ordered it, why, or whether she agreed.',
        action:'Record discovery',
    },
    'platform-index-card': {
        title:'Deadways route index',
        body:'S-17: Transfer corridor, outbound.\n\nDestination registered beyond the Last Platform.\nLocal departure shutter: RELEASE AUTHORIZED.',
        action:'Follow this lead',
    },
    'platform-shutter-card': { title:'Departure shutter', body:'STATION CONTROL: ROUTE KNOWN\n\nRelease the shutter for outbound access?', action:'Release shutter' },
    'platform-letter-card': { title:'An unfinished letter', body:'“I kept your seat. I still do.”\n\nThe rest is unwritten. Whoever folded the page did so carefully.', action:'Keep letter' },
    'platform-locked-card': { title:'A lead is missing', body:'Find the transfer entry in the Registry, then consult the lower route index. The departure shutter needs a known outbound route.', action:'Close' },
};
