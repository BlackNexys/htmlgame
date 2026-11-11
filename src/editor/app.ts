import '../ui/registerComponents';
import {LevelEditor} from './LevelEditor';
import {EditorFiles} from './EditorFiles';
import {createBlankLevel} from './createBlankLevel';
import {loadLevelSource} from '../content/LevelRegistry';

async function openWorkshop() {
    const files = new EditorFiles();
    try {
        const layout = files.restoreSourceDraft();
        if (layout) {
            const source = await loadLevelSource(layout.source);
            new LevelEditor(source.document(layout), {source, layout}); return;
        }
        new LevelEditor(files.restore() ?? createBlankLevel());
    } catch (error) {
        new LevelEditor(createBlankLevel());
        document.getElementById('editor-status')!.textContent = `Could not restore source layout: ${String(error)}. Its data remains in browser storage. Open the source after correcting it, or choose New level to discard this draft.`;
    }
}
void openWorkshop();
