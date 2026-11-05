import '../ui/registerComponents';
import { LevelEditor } from './LevelEditor';
import { EditorFiles } from './EditorFiles';
import { createBlankLevel } from './createBlankLevel';
import { LevelLoader } from '../levels/LevelLoader';

const restored = new EditorFiles().restore();
if (restored) new LevelEditor(restored);
else {
    void new LevelLoader().document('lower-passage').then(level => new LevelEditor(level)).catch(error => {
        new LevelEditor(createBlankLevel());
        document.getElementById('editor-status')!.textContent = `Could not open the example: ${error instanceof Error ? error.message : 'unknown error'}. A blank level is ready.`;
    });
}
