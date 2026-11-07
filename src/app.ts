import './ui/registerComponents';
import { Game } from './game/Game';
import { LevelLoader } from './levels/LevelLoader';
import { stationDemo } from './dialogue/stationDemo';
import { actionDemo } from './dialogue/actionDemo';
import { kineticDemo } from './dialogue/kineticDemo';

const parameters = new URLSearchParams(location.search);
const game = new Game(document.querySelector<HTMLCanvasElement>('#game')!, async signal => {
    const loader = new LevelLoader();
    const source = parameters.get('levelUrl');
    return source ? loader.loadURL(source, signal) : loader.load(parameters.get('level') || (parameters.get('dialogueDemo') === 'action' ? 'dialogue-course' : 'lower-passage'), signal);
}, parameters.get('dialogueDemo') === 'kinetic' ? kineticDemo : parameters.get('dialogueDemo') === 'action' ? actionDemo : parameters.get('dialogueDemo') === '1' ? stationDemo : undefined, parameters.has('levelUrl') || parameters.get('preview')==='1');
void game.start();
window.addEventListener('pagehide', () => game.dispose(), {once: true});
