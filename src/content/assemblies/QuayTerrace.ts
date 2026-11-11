import {defineAssembly} from '../../levels/source';

/** A solid quay with a dressed front and an optional rear building, all in local pixels. */
export const quayTerrace = defineAssembly({name: 'Inhabited quay', parameters: {
    width: {type: 'number', default: 896, min: 128, max: 1200, step: 8},
    foundation: {type: 'number', default: 336, min: 64, max: 960, step: 8},
    building: {type: 'number', default: 0, min: 0, max: 480, step: 8},
}}, (scene, p) => {
    scene.add('terrain', {id: 'floor', kind: 'wall', x: 0, y: 0, width: p.width, height: p.foundation, material: 0});
    scene.add('props',
        {id: 'front', asset: 'confluence-wall-0', x: 0, y: 32, width: p.width, height: p.foundation - 32, layer: 'foreground', light: 65},
        {id: 'front-band', asset: 'confluence-trim-station-band', x: 0, y: 24, width: p.width, height: 24, layer: 'foreground', stretch: true, light: 80});
    for (const [id, x] of [['left', 0], ['right', p.width - 24]] as const) scene.add('props', {
        id: `front-${id}`, asset: `confluence-trim-station-${id}`, x, y: 48, width: 24, height: p.foundation - 48,
        layer: 'foreground', stretch: true, light: 60,
    });
    if (p.building) {
        scene.add('props', {id: 'rear-wall', asset: 'confluence-wall-0', x: 0, y: -p.building, width: p.width, height: p.building, light: 44, depth: -100},
            {id: 'roof', asset: 'confluence-trim-station-roof', x: 0, y: -p.building - 24, width: p.width, height: 32, stretch: true, light: 65, depth: -90});
        for (let x = 48, i = 0; p.building >= 96 && x + 144 <= p.width; x += 192, i++) scene.add('props', {
            id: `window-${i}`, asset: `confluence-inset-${i % 2}`, x, y: -p.building + 48,
            width: 144, height: Math.min(176, p.building - 48), light: 64, depth: -80,
        });
    }
});
