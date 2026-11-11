import {defineAssembly} from '../../levels/source';
import {quayTerrace} from './QuayTerrace';

/** The inhabitant and their seat belong to this place, so editor movement carries them too. */
export const lamplightCourt = defineAssembly({name: 'Lamplight court', parameters: {
    building: {type: 'number', default: 384, min: 224, max: 480, step: 8},
}}, (scene, p) => {
    const quay = scene.place('quay', {x: 0, y: 0}, quayTerrace, {width: 672, foundation: 528, building: p.building});
    scene.add('props',
        {id: 'canopy', asset: 'confluence-architecture-stationCanopy', x: 96, y: -198, width: 480, height: 198, mount: {parent: quay.child('floor'), socket: 'topLeft'}},
        {id: 'bench', asset: 'confluence-bench', x: 128, y: -104, width: 176, height: 104, mount: {parent: quay.child('floor'), socket: 'topLeft'}},
        {id: 'lamp', asset: 'confluence-lamp', x: 336, y: -176, width: 56, height: 176, mount: {parent: quay.child('floor'), socket: 'topLeft'}});
    scene.add('npcs', {id: 'lamp-keeper', kind: 'rail-attendant', x: 432, y: 0, scene: 'light-left-on'});
    scene.add('interactables', {id: 'saved-seat', kind: 'inspect', x: 208, y: -72, width: 56, height: 64,
        label: 'Saved seat', reach: 88, mount: {parent: quay.child('floor'), socket: 'topLeft'}, sceneId: 'saved-seat-card',
        visual: {asset: 'confluence-letter', x: 12, y: 14, width: 32, height: 24}});
    scene.add('signs', {id: 'court-sign', x: 48, y: -p.building + 24, title: 'THE LAMPLIGHT COURT', text: 'F to talk or inspect / a moment before the next road'});
});
