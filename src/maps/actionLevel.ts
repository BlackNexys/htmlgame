// Synchronous fixture for simulation tests. The browser fetches levels on demand.
import document from '../../public/levels/lower-passage.json';
import { parseLevelDocument } from '../levels/LevelValidation';
import { compileLevel } from '../levels/LevelCompiler';
import type { Level } from '../interfaces/Level';

export function createActionLevel(): Level { return compileLevel(parseLevelDocument(document)); }
