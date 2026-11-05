import { Enemy, type EnemyProps } from '../components/Enemy';
import { Zombie } from '../components/Zombie';
import { Skeleton } from '../components/Skeleton';
import { Ghoul } from '../components/Ghoul';
import { Ghost } from '../components/Ghost';
import { Wight } from '../components/Wight';
import { Necromancer } from '../components/Necromancer';
import type { EnemyKind } from '../interfaces/Enemy';

const constructors: Record<EnemyKind, new (props: EnemyProps) => Enemy> = {
    zombie: Zombie, skeleton: Skeleton, ghoul: Ghoul, ghost: Ghost, wight: Wight, necromancer: Necromancer,
};

export function createEnemy(props: EnemyProps): Enemy {
    const Constructor = constructors[props.spawn.kind || 'zombie'];
    return new Constructor(props);
}
