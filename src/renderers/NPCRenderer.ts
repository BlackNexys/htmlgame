import type { NPC } from '../components/NPC';
import type { GameAssets } from '../interfaces/Assets';
import { npcCatalog } from '../game/NPCCatalog';

export class NPCRenderer {
    constructor(private readonly ctx: CanvasRenderingContext2D, private readonly images: GameAssets['npcs']) {}
    draw(npc: NPC) {
        const c = this.ctx, info = npcCatalog[npc.kind], image = this.images?.[npc.kind];
        const center = npc.x + npc.width / 2;
        c.save(); c.translate(Math.round(center), Math.round(npc.y2)); c.scale(npc.facing, 1);
        if (image) {
            const frame = Math.floor(npc.elapsed * 3) % info.frames, cell = image.naturalWidth / info.frames;
            const width = info.size * cell / image.naturalHeight;
            c.drawImage(image, frame * cell, 0, cell, image.naturalHeight, -width / 2, -info.size * .94, width, info.size);
        } else {
            c.fillStyle = '#283340'; c.fillRect(-13, -48, 26, 46);
            c.fillStyle = '#d6d9ca'; c.fillRect(-9, -61, 18, 16);
            c.fillStyle = '#55505b'; c.fillRect(-13, -66, 26, 7);
            c.fillStyle = '#63dfeb'; c.fillRect(4, -42, 4, 4);
            c.fillStyle = '#090c10'; c.fillRect(3, -57, 4, 4);
        }
        c.restore();
        c.save(); c.fillStyle = '#c3cfc8'; c.textAlign = 'center'; c.font = '9px monospace';
        c.fillText(npc.displayName, center, npc.y2 + 12); c.restore();
    }
}
