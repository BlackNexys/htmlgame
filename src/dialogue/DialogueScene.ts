export type Expression = 'neutral' | 'amused' | 'worried' | 'fierce';
export type Delivery = 'normal' | 'soft' | 'urgent';
export interface DialogueSpeaker {
    name: string;
    role: string;
    side: 'left' | 'right';
    accent: string;
    portrait: { image: string; row: number };
}
export interface DialogueBeat { text: string; emphasis?: 'strong' | 'soft'; pauseAfter?: number; }
export interface DialogueLine {
    kind: 'line'; speaker: string; expression: Expression; delivery?: Delivery;
    holdSeconds?: number;
    beats: DialogueBeat[];
}
export interface DialogueCue { kind: 'cue'; focus: 'left' | 'right' | 'wide'; caption: string; }
export type DialogueCommand = DialogueLine | DialogueCue | { kind: 'wait'; seconds: number };
export interface DialogueScene {
    id: string; title: string; description: string; label?: string;
    presentation?: 'cinematic' | 'overlay' | 'kinetic';
    pacing?: 'manual' | 'auto';
    speakers: Record<string, DialogueSpeaker>;
    commands: DialogueCommand[];
    /** Explicit completion effects only. Cosmetic commands are never fast-forwarded on skip. */
    completionEffects: string[];
}

/** Also used for external JSON: reject bad references before beginning a scene. */
export function parseDialogueScene(value: unknown): DialogueScene {
    const scene = value as DialogueScene;
    const fail = () => { throw new Error('Invalid dialogue scene'); };
    const text = (v: unknown) => typeof v === 'string' && v.trim().length > 0 && v.length <= 4000;
    const id = (value: unknown) => typeof value === 'string' && /^[a-z][a-z0-9-]{0,79}$/.test(value);
    if (!scene || !id(scene.id) || !text(scene.title) || !text(scene.description) ||
        scene.presentation !== undefined && !['cinematic', 'overlay', 'kinetic'].includes(scene.presentation) ||
        scene.pacing !== undefined && !['manual', 'auto'].includes(scene.pacing) ||
        scene.label !== undefined && (!text(scene.label) || scene.label.length > 80) ||
        !scene.speakers || typeof scene.speakers !== 'object' || Array.isArray(scene.speakers) ||
        !Array.isArray(scene.commands) || scene.commands.length < 1 || scene.commands.length > 300 ||
        !Array.isArray(scene.completionEffects) || !scene.completionEffects.every(id) ||
        new Set(scene.completionEffects).size !== scene.completionEffects.length) return fail();
    const speakers = Object.values(scene.speakers);
    if (!speakers.length || speakers.length > 16) return fail();
    for (const speaker of speakers) {
        if (!speaker || !text(speaker.name) || !text(speaker.role) || !['left', 'right'].includes(speaker.side) ||
            !/^#[0-9a-f]{6}$/i.test(speaker.accent) || !speaker.portrait ||
            !/^\.\/assets\/(?:[a-z0-9_-]+\/)*[a-z0-9_.-]+\.png$/i.test(speaker.portrait.image) ||
            ![0, 1].includes(speaker.portrait.row)) return fail();
    }
    let lines = 0;
    for (const command of scene.commands) {
        if (!command) return fail();
        if (command.kind === 'line') {
            lines++;
            if (!Object.hasOwn(scene.speakers, command.speaker) || !['neutral', 'amused', 'worried', 'fierce'].includes(command.expression) ||
                command.holdSeconds !== undefined && (!Number.isFinite(command.holdSeconds) || command.holdSeconds < 1 || command.holdSeconds > 30) ||
                command.delivery !== undefined && !['normal', 'soft', 'urgent'].includes(command.delivery) ||
                !Array.isArray(command.beats) || !command.beats.length || command.beats.length > 40) return fail();
            for (const beat of command.beats) if (!beat || !text(beat.text) ||
                beat.emphasis !== undefined && !['strong', 'soft'].includes(beat.emphasis) ||
                beat.pauseAfter !== undefined && (!Number.isFinite(beat.pauseAfter) || beat.pauseAfter < 0 || beat.pauseAfter > 3)) return fail();
            if (command.beats.reduce((length, beat) => length + beat.text.length, 0) > 4000) return fail();
        } else if (command.kind === 'cue') {
            if (!['left', 'right', 'wide'].includes(command.focus) || typeof command.caption !== 'string' || command.caption.length > 200) return fail();
        } else if (command.kind === 'wait') {
            if (!Number.isFinite(command.seconds) || command.seconds < 0 || command.seconds > 10) return fail();
        } else return fail();
    }
    if (!lines) return fail();
    return structuredClone(scene);
}
