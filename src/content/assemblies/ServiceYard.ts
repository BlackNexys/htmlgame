import {defineAssembly} from '../../levels/source';
import {quayTerrace} from './QuayTerrace';

/** Encounter geometry and its actors remain one editable composition. */
export const serviceYard = defineAssembly({name: 'Service yard encounter', parameters: {
    width: {type: 'number', default: 800, min: 704, max: 960, step: 8},
}}, (scene, p) => {
    scene.place('quay', {x: 0, y: 0}, quayTerrace, {width: p.width, foundation: 624, building: 320});
    scene.add('terrain', {id: 'cover', kind: 'wall', x: 400, y: -48, width: 64, height: 48, material: 1});
    scene.add('props', {id: 'cargo', asset: 'confluence-cargo', x: 400, y: -49, width: 64, height: 49, layer: 'foreground'});
    scene.add('enemies',
        {id: 'zombie', kind: 'zombie', x: 224, y: 0, patrol: {left: 128, right: 336}},
        {id: 'skeleton', kind: 'skeleton', x: p.width - 160, y: 0, patrol: {left: p.width - 240, right: p.width - 112}});
    scene.add('signs', {id: 'yard-sign', x: 40, y: -272, title: 'SERVICE YARD', text: 'Keep your aim. Watch the firing lane.'});
});
