/* eslint-disable react-hooks/refs */
import { useRef } from "react";
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

    return (
        <>
            <ViewerV2 world={world} blocks={blocks} />
        </>
    )
}