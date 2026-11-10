import type {Inspection} from './InspectionCatalog';
/** Optional local flavour for the standalone level experiment. No campaign effects. */
export const sluiceExchangeInspections:Readonly<Record<string,Inspection>>={
    'sluice-manifold-card':{title:'Exchange manifold',body:'Three receiving channels feed the river below. The maintenance diagram marks a lower towpath beneath each crossing and a western return through the pump gallery. This terminal records no passenger transfers.',action:'Close diagram'},
    'sluice-roof-card':{title:'Signal-room maintenance note',body:'The upper walk returns to the eastern viaduct. A faded maintenance note asks whoever replaces the signal lamps to leave one warm light burning for the late shift.',action:'Leave the light on'},
    'sluice-culvert-card':{title:'Return-loop pressure slate',body:'The narrow culvert leads back to the pump chamber. These flow readings belong to a local water circuit; they reveal nothing about the missing passenger or the journey beyond the station.',action:'Close slate'},
};
