/* eslint-disable react-hooks/refs */
import { useEffect } from "react"
import World from "../../entities/refocator-world"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { BlockMeta } from "@/app/shared/types/block"
import { KeyboardAdapter } from "@/app/entities/refocator-world/adapters/keyboard.adapter"
import { PointerLockMouseAdapter } from "@/app/entities/world/pointer.adapter"
import { MouseAdapter } from "@/app/entities/refocator-world/adapters/mouse.adapter"

type WorldProps = {
    world: World,
    blocks: BlockMeta[]
}

function WorldBridge({ world, blocks }: WorldProps) {
    const { gl, scene, camera } = useThree()

    useEffect(() => {
        world.attach({ scene, camera, renderer: gl })

        const keyboard = new KeyboardAdapter(window, world.input);
        let pointer: PointerLockMouseAdapter | MouseAdapter | null = null
        pointer = new MouseAdapter(gl.domElement, world.input, world);

        return () => {
            pointer?.destroy();
            keyboard.destroy();
            world.detach()
        }
    }, [world, gl, scene, camera])

    useEffect(() => {
        const record = blocks.reduce((prev, block) => ({ ...prev, [`${block.x}-${block.y}-${block.z}`]: block }), {})
        world.setBlocks(record);
    }, [blocks, world])

    useFrame((_, delta) => {
        world.tick(delta)
    })

    return null
}

type Props = {
    world: World;
    blocks: BlockMeta[]
}

export default function ViewerV2({ blocks, world }: Props) {

    return (
        <>
            <Canvas style={{ height: '100vh' }} className="w-full h-screen bg-slate-700">
                <WorldBridge world={world} blocks={blocks} />
            </Canvas>
        </>
    );
}