import { useEffect, useState } from 'react';
import World from '../world';
import { Mode } from '@/app/shared/types/mode';

export function useMode(world: World) {
    const [mode, setMode] = useState(world.mode);

    useEffect(() => {
        return world.subscribe('change_mode', setMode);
    }, [world]);

    const toggleMode = (expectedMode: Mode) => {
        world.setMode(
            mode === expectedMode
                ? 'default'
                : expectedMode
        );
    }

    return [mode, toggleMode] as const;
}