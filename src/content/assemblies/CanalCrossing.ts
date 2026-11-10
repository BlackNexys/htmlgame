import {defineAssembly} from '../../levels/source';

/** The bridge, receiving water and recovery stairs form one movable construction. */
export const canalCrossing = defineAssembly({name: 'Canal crossing and recovery', parameters: {
    lamps: {type: 'boolean', default: true},
}}, (scene, p) => {
    for (const [id, x] of [['west', 96], ['east', 512]] as const) {
        scene.add('terrain', {id: `deck-${id}`, kind: 'bridge', x, y: 0, width: 320, height: 112, thickness: 24, material: 1});
        scene.add('props', {id: `arch-${id}`, asset: 'confluence-architecture-bridgeDeck', x, y: 0, width: 320, height: 113, layer: 'foreground'});
        for (const [side, dx, floor] of [['left', 24, id === 'west' ? 576 : 384], ['right', 264, id === 'west' ? 480 : 288]] as const) scene.add('props', {
            id: `pier-${id}-${side}`, asset: 'confluence-steel-beam', x: x + dx, y: 100, width: 32, height: floor - 100, light: 42, depth: -20,
        });
        if (p.lamps) scene.add('props', {id: `lamp-${id}`, asset: 'confluence-lamp', x: x + 24, y: -176, width: 56, height: 176});
    }
    const stairs = [{id: 'catch', x: 0, y: 576, width: 240},
        {id: 'return-1', x: 288, y: 480, width: 192}, {id: 'return-2', x: 480, y: 384, width: 192},
        {id: 'return-3', x: 672, y: 288, width: 192}, {id: 'return-4', x: 864, y: 192, width: 128}];
    for (const step of stairs) {
        scene.add('terrain', {...step, kind: 'wall', height: 720 - step.y, material: 1});
        scene.add('props', {id: `${step.id}-face`, asset: 'confluence-wall-1', x: step.x, y: step.y + 24, width: step.width, height: 696 - step.y, layer: 'foreground', light: 58});
    }
    scene.add('water',
        {id: 'gutter', kind: 'drain', x: 56, y: 8, width: 144, height: 32, mount: {parent: 'deck-west', socket: 'bottomLeft'}},
        {id: 'collector', kind: 'basin', x: 120, y: 192, width: 192, height: 40},
        {id: 'gutter-fall', kind: 'waterfall', x: 0, y: 0, width: 24, from: {parent: 'gutter', socket: 'mouth'}, to: 'collector'});
    scene.add('props', {id: 'collector-bearing', asset: 'confluence-steel-beam', x: 120, y: 232, width: 192, height: 24, light: 50});
    scene.add('props', {id: 'collector-hanger', asset: 'confluence-steel-beam', x: 296, y: 24, width: 16, height: 208, light: 50});
    scene.add('signs', {id: 'recovery-sign', x: 16, y: 520, title: 'LOW WALK / EAST', text: 'The stairs return to the upper quay.'});
});
