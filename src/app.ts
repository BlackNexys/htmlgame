import './ui/registerComponents';
import { Game } from './game/Game';

const game = new Game(document.querySelector<HTMLCanvasElement>('#game')!);
void game.start();
