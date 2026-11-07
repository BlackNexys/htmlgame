import { RailAttendant } from '../components/RailAttendant';
import type { NPC } from '../components/NPC';
import type { NPCSpawn, NPCKind } from '../interfaces/NPC';

const constructors: Record<NPCKind, new (spawn: NPCSpawn) => NPC> = {'rail-attendant': RailAttendant};
export function createNPC(spawn: NPCSpawn): NPC { return new constructors[spawn.kind](spawn); }
