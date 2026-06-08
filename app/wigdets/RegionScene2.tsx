"use client"
/* eslint-disable react-hooks/refs */
import { useEffect, useRef, useState } from "react";
import World from "../entities/refocator-world";
import ViewerV2 from "../features/viewer-v2";
import { BlockMeta } from "../shared/types/block";
import { FieldLabel } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Image from "next/image";
import SeetingsBlock from "../features/settings/ui/SettingsBlock";
import { ModalType } from "../shared/types/modal";
import BlockList from "../features/block-list";
import AddBlock from "../features/add-block";


type Props = {
    blocks: Record<string, BlockMeta>;
    world?: World;
}

export default function RegionScene2({ world: initialWorld, blocks }: Props) {

    const [showProgress, setShowProgress] = useState(false)
    const worldRef = useRef(initialWorld ?? new World());
    const world = worldRef.current
    const [progress, setProgress] = useState(0)
    const [path, setPath] = useState<string | null>(null)
    const [modalType, setModalType] = useState<ModalType>(null);

    useEffect(() => {
        const showed = new Set<string>([])

        const unsub = world.subscribe('onFailedLoadTexture', (name, err) => {
            if (showed.has(name)) { return }
            console.error("failed to fetch block:", name, err)
            showed.add(name);
        })

        return unsub
    }, [world])

    useEffect(() => {
        const unsub = world.subscribe('onClickBlock', (key, side) => {
            try {
                const path = world.getTexturePath(key)
                setPath(Array.isArray(path) ? path[0] : path ?? null)
            } catch (e) {
                console.error('e', e);
            }
        })

        return unsub
    }, [world])

    useEffect(() => {
        const unsubStart = world.subscribe('onStartLoadBlocks', () => setShowProgress(true))
        return unsubStart
    }, [world])

    useEffect(() => {
        const unsub = world.subscribe('progressSettingBlocks', (current, total) => {
            setProgress((current / total) * 100);
        })
        world.setBlocks(blocks);

        return unsub

    }, [blocks, world])

    useEffect(() => {
        const unsub = world.subscribe('onBlocksSetted', () => {
            setTimeout(() => {
                setShowProgress(false)
            }, 2000)
        })

        return unsub
    }, [world])

    const modalProps = {
        modalType,
        setModalType
    }

    return (
        <>
            <div className={cn("w-full fixed bottom-4 left-0 z-100 flex items-center justify-center opacity-0 transition-all", showProgress && "opacity-100")} style={{ height: 60 }}>
                <div className="w-2/3 h-full flex flex-col px-2 py-2 bg-white rounded-xl relative">
                    <FieldLabel htmlFor="progress-upload">
                        <span>Loading blocks</span>
                        <span className="ml-auto">{progress}%</span>
                    </FieldLabel>
                    <Progress value={progress} id="progress-upload" />
                </div>
            </div>
            <div className={`${"fixed bottom-4 z-100 h-14 w-full flex items-center justify-center"}`}>
                <div className="w-2/3 h-full px-2 py-2 bg-white rounded-full flex flex-row gap-2">
                    <SeetingsBlock {...modalProps} world={world} />
                    <BlockList {...modalProps} world={world} />
                    <AddBlock world={world} />
                </div></div>
            {path && <div title={path} className="size-10 flex items-center justify-center rounded-full fixed bottom-4 right-4 z-100 bg-white">
                <Image width={16} height={16} src={`/block/${path}.png`} alt={`/block/${path}.png`} />
            </div>}
            <ViewerV2 world={world} />
        </>
    )
}