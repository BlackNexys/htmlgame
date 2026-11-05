import './ui/registerComponents';
import { Game } from './game/Game';
import { LevelLoader } from './levels/LevelLoader';

const parameters = new URLSearchParams(location.search);
const game = new Game(document.querySelector<HTMLCanvasElement>('#game')!, async signal => {
    const loader = new LevelLoader();
    const source = parameters.get('levelUrl');
    return source ? loader.loadURL(source, signal) : loader.load(parameters.get('level') || 'lower-passage', signal);
});
void game.start();
window.addEventListener('pagehide', () => game.dispose(), {once: true});
