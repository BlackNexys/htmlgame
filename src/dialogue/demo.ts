import '../ui/registerComponents';
import { DialogueSession } from './DialogueSession';
import { stationDemo } from './stationDemo';
import { kineticDemo } from './kineticDemo';
import type { DialogueScene } from './DialogueScene';
import type { BlButton } from '@blacklight/signal-soul/atoms';

const start = document.querySelector<BlButton>('#demo-start')!;
const kinetic = document.querySelector<BlButton>('#demo-kinetic')!;
const applied = new Set<string>();
let session: DialogueSession | undefined;
let effects = 0;
document.addEventListener('dialoguecue', event => {
    document.querySelector<HTMLElement>('.demo-scenery')!.dataset.focus = (event as CustomEvent<{focus: string}>).detail.focus;
});
function play(scene: DialogueScene, button: BlButton) {
    if (session) return;
    session = new DialogueSession(scene, () => {
        document.querySelector('#demo-effect')!.textContent = `Completion effect: applied ${++effects} time (replays do not duplicate it)`;
    }, result => {
        session = undefined;
        document.querySelector<HTMLElement>('.demo-scenery')!.dataset.focus = 'wide';
        document.querySelector('#demo-result')!.textContent = `Scene ${result}. Replay to compare expressions, pacing, and skipping.`;
        button.textContent = button === kinetic ? 'Replay kinetic exchange' : 'Replay conversation'; button.focus({preventScroll: true});
    }, applied);
}
start.addEventListener('click', () => play(stationDemo, start));
kinetic.addEventListener('click', () => play(kineticDemo, kinetic));
window.addEventListener('pagehide', () => { session?.dispose(); }, {once: true});
