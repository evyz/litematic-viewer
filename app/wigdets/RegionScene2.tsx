/* eslint-disable react-hooks/refs */
import { useEffect, useRef } from "react";
import World from "../entities/refocator-world";
import ViewerV2 from "../features/viewer-v2";
import { BlockMeta } from "../shared/types/block";


type Props = {
    blocks: BlockMeta[];
    world?: World;
}

export default function RegionScene2({ world: initialWorld, blocks }: Props) {

    const worldRef = useRef(initialWorld ?? new World());
    const world = worldRef.current

    useEffect(() => {
        const showed = new Set<string>([])

        const unsub = world.subscribe('onFailedLoadTexture', (name, err) => {
            if (showed.has(name)) { return }
            console.error("failed to fetch block:", name, err)
            showed.add(name);
        })

        return unsub
    }, [world])

    return (
        <>
            <ViewerV2 world={world} blocks={blocks} />
        </>
    )
}