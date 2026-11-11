import type { LevelDocument } from './LevelDocument';
import type { Rect } from '../interfaces/Geometry';
import { enemyTuning } from '../game/config';
import { overlaps } from '../game/movement/physics';
import { npcCatalog } from '../game/NPCCatalog';
import type { NPCKind } from '../interfaces/NPC';
import { sceneFor } from '../dialogue/SceneCatalog';
import { sceneRules } from '../narrative/SceneResolver';
import { inspections } from '../narrative/InspectionCatalog';
import { effectCatalog } from '../narrative/EffectApplier';
import { conditions } from '../narrative/Conditions';
import type { InteractionKind } from '../interfaces/Interactable';
import {structureKinds,type StructureDefinition} from '../world/structures/StructureDefinition';
import {resolveStructures} from '../world/scene/AttachmentResolver';
import {parseWaterDefinitions} from '../world/water/WaterValidation';
import {WaterNetwork} from '../world/water/WaterNetwork';
import {parseProps,parsePresentation,parseVisual} from '../world/props/PropValidation';
import {resolveProps} from '../world/props/PropResolver';
import {resolveInteractables} from '../world/scene/InteractableResolver';

const slug = /^[a-z][a-z0-9-]{0,79}$/;
export class LevelValidationError extends Error {
    constructor(public readonly issues: string[]) { super(issues.join('\n')); this.name = 'LevelValidationError'; }
}

/** Validate untrusted JSON before it reaches the simulation or editor history. */
export function parseLevelDocument(value: unknown): LevelDocument {
    const issues: string[] = [];
    const fail = (path: string, message: string) => { issues.push(`${path}: ${message}`); };
    const object = (input: unknown, path: string, keys: string[]): Record<string, unknown> => {
        if (!input || typeof input !== 'object' || Array.isArray(input)) { fail(path, 'must be an object'); return {}; }
        const result = input as Record<string, unknown>;
        for (const key of Object.keys(result)) if (!keys.includes(key)) fail(`${path}.${key}`, 'unknown field');
        return result;
    };
    const number = (input: unknown, path: string, min: number, max: number) => {
        if (typeof input !== 'number' || !Number.isFinite(input) || !Number.isInteger(input) || input < min || input > max) {
            fail(path, `must be an integer between ${min} and ${max}`); return min;
        }
        return input;
    };
    const string = (input: unknown, path: string, max: number) => {
        if (typeof input !== 'string' || !input.trim() || input.length > max) { fail(path, `must be nonempty text up to ${max} characters`); return ''; }
        return input;
    };
    const id = (input: unknown, path: string) => {
        const result = string(input, path, 80);
        if (!slug.test(result)) fail(path, 'use lowercase letters, numbers, and hyphens, starting with a letter');
        return result;
    };
    const root = object(value, 'level', ['schemaVersion', 'id', 'name', 'revision', 'tileSize', 'gridSize', 'width', 'height', 'spawn', 'exit', 'terrain', 'decorations', 'enemies', 'npcs', 'interactables', 'signs','water','props','presentation']);
    const legacy=root.schemaVersion===1;
    if (!legacy && root.schemaVersion!==2) fail('schemaVersion', 'only versions 1 and 2 are supported');
    if (legacy && root.tileSize !== 48) fail('tileSize', 'version 1 uses 48-pixel tiles');
    if(legacy&&root.gridSize!==undefined)fail('gridSize','version 1 uses tileSize; gridSize belongs to version 2');
    if(legacy&&root.water!==undefined)fail('water','authored water requires schema version 2');
    if(legacy&&(root.props!==undefined||root.presentation!==undefined))fail('props','scene presentation requires schema version 2');
    if(!legacy && root.tileSize!==undefined)fail('tileSize','version 2 uses optional editor gridSize, not physical tiles');
    const gridSize=legacy?48:number(root.gridSize??8,'gridSize',1,256);
    const width = number(root.width, 'width', 960, 32736);
    const height = number(root.height, 'height', 576, 16368);
    if (legacy && (width % 48 || height % 48)) fail('dimensions', 'version 1 dimensions must be multiples of 48');
    const point = (input: unknown, path: string, keys = ['x', 'y']) => {
        const p = object(input, path, keys);
        return {x: number(p.x, `${path}.x`, 0, width), y: number(p.y, `${path}.y`, 0, height)};
    };
    const rect = (input: unknown, path: string, identified = false) => {
        const keys = ['x', 'y', 'width', 'height', ...(identified ? ['id'] : [])];
        const p = object(input, path, keys);
        const result = {...point(input, path, keys), width: number(p.width, `${path}.width`, 1, width), height: number(p.height, `${path}.height`, 1, height)};
        if (result.x + result.width > width || result.y + result.height > height) fail(path, 'rectangle extends outside the level');
        return result;
    };
    const seen = new Set<string>();
    const objectId = (input: unknown, path: string) => {
        const result = id(input, `${path}.id`);
        if (seen.has(result)) fail(`${path}.id`, 'must be unique across all collections');
        seen.add(result);
        return result;
    };
    const array = <T>(input: unknown, path: string, parse: (item: unknown, path: string) => T): T[] => {
        if (!Array.isArray(input)) { fail(path, 'must be an array'); return []; }
        if (input.length > 1000) { fail(path, 'at most 1000 objects are allowed'); return []; }
        return input.map((item, index) => parse(item, `${path}[${index}]`));
    };
    let tiles = 0;
    const terrain = (input: unknown, path: string):StructureDefinition => {
        const p = object(input, path, ['id', 'x', 'y', 'width', 'height',...(!legacy?['kind','material','thickness','mount','layer','depth']:[])]);
        const mount=p.mount===undefined?undefined:object(p.mount,`${path}.mount`,['parent','socket']);
        const bounds={x:number(p.x,`${path}.x`,mount?-width:0,width),y:number(p.y,`${path}.y`,mount?-height:0,height),width:number(p.width,`${path}.width`,1,width),height:number(p.height,`${path}.height`,1,height)};
        if(!mount&&(bounds.x+bounds.width>width||bounds.y+bounds.height>height))fail(path,'rectangle extends outside the level');
        if (legacy && [bounds.x, bounds.y, bounds.width, bounds.height].some(n => n % 48)) fail(path, 'terrain and decorations must align to the 48-pixel grid');
        tiles += bounds.width * bounds.height / (48 * 48);
        const result:StructureDefinition={id:objectId(p.id,path),...bounds};
        if(p.kind!==undefined){if(!structureKinds.includes(p.kind as typeof structureKinds[number]))fail(`${path}.kind`,'unknown structure kind');else result.kind=p.kind as typeof result.kind;}
        result.material=number(p.material??0,`${path}.material`,0,3);
        if(p.depth!==undefined)result.depth=number(p.depth,`${path}.depth`,-1024,1024);
        if(p.layer!==undefined){if(!['rear','foreground'].includes(String(p.layer))||path.startsWith('terrain'))fail(`${path}.layer`,'only decorations can select rear or foreground');else result.layer=p.layer as 'rear'|'foreground';}
        if(p.thickness!==undefined){
            result.thickness=number(p.thickness,`${path}.thickness`,1,bounds.height);
            if(!['bridge','platform','doorway'].includes(result.kind??'wall'))fail(`${path}.thickness`,'only bridges, platforms and doorways accept thickness');
        }
        if(result.kind==='doorway' && (bounds.width<3||bounds.height<3||(result.thickness!==undefined&&(result.thickness*2>=bounds.width||result.thickness>=bounds.height))))fail(path,'doorway requires an open interior');
        if(result.kind==='outfall'&&path.startsWith('terrain'))fail(path,'outfalls belong to decorative structures');
        if(mount)result.mount={parent:id(mount.parent,`${path}.mount.parent`),socket:string(mount.socket,`${path}.mount.socket`,80)};
        return result;
    };
    const result: LevelDocument = {
        schemaVersion: 2, id: id(root.id, 'id'), name: string(root.name, 'name', 120),
        revision: number(root.revision, 'revision', 0, Number.MAX_SAFE_INTEGER - 1), gridSize, width, height,
        spawn: point(root.spawn, 'spawn'), exit: rect(root.exit, 'exit'),
        terrain: array(root.terrain, 'terrain', terrain), decorations: array(root.decorations, 'decorations', terrain),
        water:[],props:[],
        enemies: array(root.enemies, 'enemies', (input, path) => {
            const p = object(input, path, ['id', 'kind', 'x', 'y', 'patrol']);
            const kind = p.kind as keyof typeof enemyTuning;
            if (typeof kind !== 'string' || !Object.hasOwn(enemyTuning, kind)) fail(`${path}.kind`, 'unknown enemy kind');
            const patrol = object(p.patrol, `${path}.patrol`, ['left', 'right']);
            return {id: objectId(p.id, path), kind, ...point(input, path, ['id', 'kind', 'x', 'y', 'patrol']), patrol: {
                left: number(patrol.left, `${path}.patrol.left`, 0, width), right: number(patrol.right, `${path}.patrol.right`, 0, width),
            }};
        }),
        signs: array(root.signs, 'signs', (input, path) => {
            const p = object(input, path, ['id', 'x', 'y', 'title', 'text']);
            return {id: objectId(p.id, path), ...point(input, path, ['id', 'x', 'y', 'title', 'text']), title: string(p.title, `${path}.title`, 120), text: string(p.text, `${path}.text`, 300)};
        }),
        npcs: root.npcs === undefined ? [] : array(root.npcs, 'npcs', (input, path) => {
            const p = object(input, path, ['id', 'kind', 'x', 'y', 'scene']);
            const kind = p.kind as NPCKind;
            if (typeof kind !== 'string' || !Object.hasOwn(npcCatalog, kind)) fail(`${path}.kind`, 'unknown NPC kind');
            const scene = id(p.scene, `${path}.scene`);
            if (!sceneFor(scene) && !Object.hasOwn(sceneRules,scene)) fail(`${path}.scene`, 'unknown dialogue scene');
            return {id: objectId(p.id, path), kind, scene, ...point(input, path, ['id', 'kind', 'x', 'y', 'scene'])};
        }),
        interactables: root.interactables===undefined?[]:array(root.interactables,'interactables',(input,path)=>{
            const keys=['id','kind','x','y','width','height','label','reach','sceneId','effectId','conditionId','solid',...(!legacy?['mount','visual']:[])];
            const p=object(input,path,keys),kind=p.kind as InteractionKind;
            if(!['inspect','collect','operate'].includes(kind))fail(`${path}.kind`,'unknown interaction kind');
            const mount=p.mount===undefined?undefined:object(p.mount,`${path}.mount`,['parent','socket']);
            const bounds={x:number(p.x,`${path}.x`,mount?-width:0,width),y:number(p.y,`${path}.y`,mount?-height:0,height),width:number(p.width,`${path}.width`,8,480),height:number(p.height,`${path}.height`,8,480)};
            if(bounds.x+bounds.width>width || bounds.y+bounds.height>height)fail(path,'object extends outside the level');
            const sceneId=id(p.sceneId,`${path}.sceneId`);
            if(!Object.hasOwn(inspections,sceneId) && !sceneFor(sceneId))fail(`${path}.sceneId`,'unknown inspection or scene');
            const effectId=p.effectId===undefined?undefined:id(p.effectId,`${path}.effectId`);
            const effect=effectId && Object.hasOwn(effectCatalog,effectId)?effectCatalog[effectId]:undefined;
            if(effectId && (!effect || effect.source!==kind || effect.scene && effect.scene!==sceneId))fail(`${path}.effectId`,'effect does not match the physical interaction');
            const conditionId=p.conditionId===undefined?undefined:id(p.conditionId,`${path}.conditionId`);
            if(conditionId && !Object.hasOwn(conditions,conditionId))fail(`${path}.conditionId`,'unknown condition');
            if(p.solid!==undefined && typeof p.solid!=='boolean')fail(`${path}.solid`,'must be boolean');
            if(p.solid && kind!=='operate')fail(`${path}.solid`,'only operated objects can block movement');
            let visual;try{if(p.visual!==undefined)visual=parseVisual(p.visual);}catch(error){fail(`${path}.visual`,String(error));}
            return {id:objectId(p.id,path),kind,...bounds,label:string(p.label,`${path}.label`,80),reach:number(p.reach??80,`${path}.reach`,16,160),sceneId,
                ...(effectId?{effectId}:{}),...(conditionId?{conditionId}:{}),...(p.solid?{solid:true}:{}),...(visual?{visual}:{}),...(mount?{mount:{parent:id(mount.parent,`${path}.mount.parent`),socket:string(mount.socket,`${path}.mount.socket`,80)}}:{})};
        }),
    };
    try{result.water=parseWaterDefinitions(root.water,{width,height},objectId);}catch(error){fail('water',error instanceof Error?error.message:'Invalid water definitions');}
    try{result.props=parseProps(root.props,result,objectId);const p=parsePresentation(root.presentation);if(p)result.presentation=p;}catch(error){fail('props',String(error));}
    if (legacy && tiles > 10000) fail('terrain', 'at most 10000 expanded legacy tiles are allowed, including decorations');
    let blocks:(Rect & {owner?:string})[]=result.terrain;
    let interactions=result.interactables;
    if(!issues.length)try{
        const structures=resolveStructures(result.terrain,result.decorations);
        resolveProps(result.props,structures,result);
        interactions=resolveInteractables(result.interactables,structures,result);
        blocks=[];let parts=0;
        for(const structure of structures){
            const colliders=structure.colliderParts();parts+=colliders.length+structure.surfaces().length;
            if(parts>10000){fail('terrain','at most 10000 generated collision and surface parts are allowed');break;}
            blocks.push(...colliders);
        }
        for(const s of structures)if(s.x<0||s.y<0||s.x2>width||s.y2>height)fail(s.id,'resolved structure extends outside the level');
        if(!issues.length)new WaterNetwork(result.water,structures,{width,height},blocks);
    }catch(error){fail('terrain',error instanceof Error?error.message:'Invalid structure attachments');}
    if(!issues.length)for(let i=0;i<blocks.length;i++)for(let j=0;j<i;j++)if(blocks[i].owner!==undefined&&blocks[i].owner===blocks[j].owner)continue;else if(overlaps(blocks[i],blocks[j]))fail('terrain',`overlaps ${blocks[j].owner??result.terrain[j]?.id}`);
    const actor = (x: number, y: number, w: number, h: number, path: string) => {
        const bounds: Rect = {x: x - w / 2, y: y - h, width: w, height: h};
        if (bounds.x < 0 || bounds.y < 0 || bounds.x + w > width || y > height) fail(path, 'actor bounds extend outside the level');
        if (blocks.some(block => overlaps(bounds, block))) fail(path, 'actor overlaps solid terrain');
    };
    actor(result.spawn.x, result.spawn.y, 32, 52, 'spawn');
    if (blocks.some(block => overlaps(result.exit, block))) fail('exit', 'overlaps solid terrain');
    result.enemies.forEach((enemy, index) => {
        const stats = Object.hasOwn(enemyTuning, enemy.kind) ? enemyTuning[enemy.kind] : undefined;
        if (!stats) return;
        actor(enemy.x, enemy.y, stats.width, stats.height, `enemies[${index}]`);
        if (enemy.patrol.left > enemy.x || enemy.patrol.right < enemy.x || enemy.patrol.left > enemy.patrol.right) fail(`enemies[${index}].patrol`, 'range must contain the enemy');
        if (enemy.patrol.left < stats.width / 2 || enemy.patrol.right + stats.width / 2 > width) fail(`enemies[${index}].patrol`, 'actor bounds extend outside the level');
    });
    result.npcs.forEach((npc, index) => {
        const info = Object.hasOwn(npcCatalog, npc.kind) ? npcCatalog[npc.kind] : undefined;
        if (info) actor(npc.x, npc.y, info.width, info.height, `npcs[${index}]`);
    });
    interactions.forEach((item,index)=>{
        if(item.solid && blocks.some(wall=>overlaps(item,wall)))fail(`interactables[${index}]`,'solid object overlaps terrain');
        if(item.solid && overlaps(item,{x:result.spawn.x-16,y:result.spawn.y-52,width:32,height:52}))fail(`interactables[${index}]`,'solid object overlaps player spawn');
    });
    if (!issues.length && new TextEncoder().encode(JSON.stringify(result)).byteLength > 1_000_000) fail('level', 'document exceeds 1 MB');
    if (issues.length) throw new LevelValidationError(issues);
    return result;
}

export function parseLevelJson(json: string): LevelDocument {
    if (json.length > 1_000_000 || new TextEncoder().encode(json).byteLength > 1_000_000) throw new LevelValidationError(['level: file exceeds 1 MB']);
    let value: unknown;
    try { value = JSON.parse(json); } catch { throw new LevelValidationError(['level: invalid JSON syntax']); }
    return parseLevelDocument(value);
}
