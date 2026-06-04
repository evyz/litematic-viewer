/* eslint-disable react-hooks/refs */
import { useEffect } from "react"
import World from "../../entities/world"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { MouseAdapter } from "../../entities/world/mouse.adapter"
import { KeyboardAdapter } from "../../entities/world/keyboard.adapter"
import { PointerLockMouseAdapter } from "../../entities/world/pointer.adapter"
import { Block } from "@/app/shared/types/block"

type WorldProps = {
    world: World,
    isLockedCursor: boolean,
    onDestroy?: () => void, blocks: Block[]
}

function WorldBridge({ world, isLockedCursor, onDestroy, blocks }: WorldProps) {
    const { gl, scene, camera } = useThree()

    useEffect(() => {
        world.attach({ scene, camera, renderer: gl })

        const keyboard = new KeyboardAdapter(window, world.input);
        let pointer: PointerLockMouseAdapter | MouseAdapter | null = null
        if (isLockedCursor) {
            pointer = new PointerLockMouseAdapter(gl.domElement, world.input, onDestroy);
        } else {
            pointer = new MouseAdapter(gl.domElement, world.input, world);
        }

        return () => {
            pointer?.destroy();
            keyboard.destroy();
            world.detach()
        }
    }, [world, gl, scene, camera, isLockedCursor, onDestroy])

    useEffect(() => {
        world.setBlocks(blocks);
    }, [blocks, world])

    useFrame((_, delta) => {
        world.tick(delta)
    })

    return null
}

type Props = {
    blocks: Block[];
    world: World;
    isLockedCursor: boolean;
    onDestroy?: () => void;
}

export default function Viewer({ blocks, world, isLockedCursor, onDestroy }: Props) {

    return (
        <>
            <Canvas style={{ height: '100vh' }} className="w-full h-screen bg-slate-700">
                <WorldBridge world={world} isLockedCursor={isLockedCursor} onDestroy={onDestroy} blocks={blocks} />
            </Canvas>
        </>
    );
}