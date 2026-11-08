import type { Effect } from './EffectApplier';

export const lastPlatformEffects: Readonly<Record<string,Effect>> = {
    'platform-arrive': { source:'stage', actions:[{type:'fact',id:'platform-arrival'}] },
    'platform-introduction': { source:'npc', actions:[{type:'fact',id:'platform-met-attendant'},{type:'fact',id:'platform-knows-registry'}] },
    'platform-record-reaction': {
        source:'npc', condition:'platform-has-record',
        actions:[{type:'fact',id:'platform-met-attendant'},{type:'fact',id:'platform-knows-destination'},{type:'milestone',id:'platform-registry-investigated'}],
    },
    'platform-inspect-ledger': { source:'inspect', scene:'platform-ledger-card', actions:[{type:'fact',id:'platform-found-transfer'}] },
    'platform-decode-route': {
        source:'inspect', scene:'platform-index-card', condition:'platform-has-record',
        actions:[{type:'fact',id:'platform-knows-destination'},{type:'milestone',id:'platform-registry-investigated'}],
    },
    'platform-collect-letter': { source:'collect', scene:'platform-letter-card', actions:[{type:'keepsake',id:'platform-letter'},{type:'object',state:'collected'}] },
    'platform-open-shutter': { source:'operate', scene:'platform-shutter-card', condition:'platform-has-destination', actions:[{type:'object',state:'operated'}] },
    'platform-complete': {
        source:'stage', condition:'platform-has-destination',
        actions:[{type:'complete-stage',id:'last-platform-demo'},{type:'unlock-stage',id:'outbound-line'}],
    },
};
