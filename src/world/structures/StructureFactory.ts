import type {StructureDefinition} from './StructureDefinition';
import {WallSection} from './WallSection';
import {Platform} from './Platform';
import {Bridge} from './Bridge';
import {Doorway} from './Doorway';
import {Outfall} from './Outfall';
import {Railing} from './Railing';
import type {Structure} from './Structure';
export function createStructure(definition:StructureDefinition,solid=true):Structure {
    switch(definition.kind??'wall'){
        case 'wall':return new WallSection(definition,solid);
        case 'platform':return new Platform(definition,solid);
        case 'bridge':return new Bridge(definition,solid);
        case 'doorway':return new Doorway(definition,solid);
        case 'outfall':return new Outfall(definition,solid);
        case 'railing':return new Railing(definition,solid);
        default:throw Error('Unsupported structure type');
    }
}
