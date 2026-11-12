import {lamplightCourt} from '../assemblies/LamplightCourt';
import {serviceYard} from '../assemblies/ServiceYard';
import {defineLevel} from '../../levels/source';
import {quayTerrace} from '../assemblies/QuayTerrace';
import {canalCrossing} from '../assemblies/CanalCrossing';

/** First experience slice: draft scene, standalone from campaign progression. */
export default defineLevel({id: 'lantern-quay', name: 'A Light Left On', revision: 1,
    width: 4800, height: 1800, gridSize: 8,
    spawn: {x: 160, y: 1120}, exit: {x: 4640, y: 916, width: 64, height: 108},
    presentation: {environment: 'confluence', scenery: 'authored'},
}, scene => {
    const riverY = 1456;
    scene.place('arrival', {x: 0, y: 1120}, quayTerrace, {width: 896, foundation: riverY - 1120, building: 320});
    for (let i = 0; i < 3; i++) {
        const y = 1024 - i * 96;
        scene.place(`ascent-${i + 1}`, {x: 896 + i * 224, y}, quayTerrace, {width: 224, foundation: riverY - y});
    }
    scene.place('lookout', {x: 1568, y: 736}, quayTerrace, {width: 384, foundation: riverY - 736});
    const crossing = scene.place('crossing', {x: 1952, y: 736}, canalCrossing);
    scene.place('encounter', {x: 2944, y: 832}, serviceYard);
    scene.place('courtyard', {x: 3744, y: 928}, lamplightCourt);
    scene.place('departure', {x: 4416, y: 1024}, quayTerrace, {width: 384, foundation: riverY - 1024});
    scene.add('water', {id: 'soul-river', kind: 'river', x: 0, y: riverY, width: 4800, height: 344, current: 12},
        {id: 'collector-return', kind: 'waterfall', x: 0, y: 0, width: 14, from: {parent: crossing.child('collector'), socket: 'spill'}, to: 'soul-river', overRim: true});
    scene.add('props',
        {id: 'arrival-canopy', asset: 'confluence-architecture-stationCanopy', x: 64, y: -198, width: 480, height: 198, mount: {parent: 'arrival--floor', socket: 'topLeft'}},
        {id: 'arrival-bench', asset: 'confluence-bench', x: 232, y: -104, width: 176, height: 104, mount: {parent: 'arrival--floor', socket: 'topLeft'}},
        {id: 'arrival-terminal', asset: 'confluence-timetable', x: 640, y: -133, width: 176, height: 133, mount: {parent: 'arrival--floor', socket: 'topLeft'}},
        {id: 'arrival-lamp', asset: 'confluence-lamp', x: 560, y: -176, width: 56, height: 176, mount: {parent: 'arrival--floor', socket: 'topLeft'}},
        {id: 'departure-lamp', asset: 'confluence-lamp', x: 4496, y: 848, width: 56, height: 176});
    scene.add('signs',
        {id: 'arrival-sign', x: 64, y: 832, title: 'A LIGHT LEFT ON', text: 'A passage through the Confluence / draft experience slice'},
        {id: 'ascent-sign', x: 944, y: 960, title: 'UPPER QUAY', text: 'Hold jump to rise. Keep moving.'},
        {id: 'crossing-sign', x: 1600, y: 656, title: 'CANAL CROSSING / EAST', text: 'Miss a landing? The low walk returns below.'});
});
