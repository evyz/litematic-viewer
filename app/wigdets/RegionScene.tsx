/* eslint-disable react-hooks/refs */
import { useEffect, useRef, useState } from "react";
import Viewer from "../features/viewer/Viewer";
import World from "../entities/world";
import Cursor from "../features/cursor/ui/cursor";
import { ModalType } from "../shared/types/modal";
import BlockDetailsContainer from "../features/block-details/container";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CoordsState } from "../features/selection-box-coords/types";
import SelectionBoxCoordsContainer from "../features/selection-box-coords";
import RemoveBlockContainer from "../features/remove-block";
import CursorContainer from "../features/cursor/ui";
import { Block } from "../shared/types/block";
import SeetingsBlock from "../features/settings/ui/SettingsBlock";
import ScreenCameraState from "../features/screen-camera-state";
import AddBlock from "../features/add-block";


type Props = {
    blocks: Block[];
    usedBlocks: Record<string, number>;
    world?: World;
}

const inputStyle = cn(
    'w-1/2',
    'border-1 border-black'
)

export default function RegionScene({ blocks, usedBlocks, world: initialWorld }: Props) {
    const [isLockedCursor, setIsLockedCursor] = useState(false);
    const [modalType, setModalType] = useState<ModalType>(null);
    const [selectionCoords, setSelectionCoords] = useState<CoordsState>(null);
    const [selectedBoxes, setSelectedBoxes] = useState<Block[]>([])

    const worldRef = useRef(initialWorld ?? new World({}));
    const world = worldRef.current

    useEffect(() => {
        return world.subscribe('update_selection_box', (box, selected) => {
            setSelectionCoords(box ? { p1: [box.position.x, box.position.y, box.position.z], p2: [box.scale.x, box.scale.y, box.scale.z] } : null)
            setSelectedBoxes(selected)
        })
    }, [world])

    const [editBlocks, setEditBlocks] = useState<{ id: string, block: string, newBlock: string }[]>([
        { id: new Date().toISOString(), block: 'minecraft:dirt', newBlock: 'minecraft:spruce_wood' }
    ])
    const lastEditBlock = editBlocks[editBlocks.length - 1];

    const replaceBlocks = async () => {
        await world.replace(editBlocks.reduce((prev, next) => ({ ...prev, [next.block]: next.newBlock }), {}))
    }

    return (
        <>
            {!!selectionCoords &&
                <div className="w-100 h-110 fixed top-50 z-100 right-2 bg-white rounded-4xl px-2 py-4">
                    {editBlocks.map(row =>
                        <div key={row.id} className="w-full flex flex-row items-center justify-between">
                            <input value={row.block} onChange={(e) => setEditBlocks(prev => [...prev.map(item => item.id !== row.id ? item : { ...item, block: e.target.value })])} className={inputStyle} />
                            <input value={row.newBlock} onChange={(e) => setEditBlocks(prev => [...prev.map(item => item.id !== row.id ? item : { ...item, newBlock: e.target.value })])} className={inputStyle} />
                        </div>
                    )}
                    <div className="w-full flex flex-row items-center justify-between">
                        {!!lastEditBlock.block.length && !!lastEditBlock.newBlock.length ?
                            <Button onClick={() => setEditBlocks(prev => [...prev, { id: new Date().toISOString(), block: '', newBlock: '' }])}>New row</Button>
                            : <div></div>}
                        <Button onClick={replaceBlocks}>Replace</Button>
                    </div>
                </div>
            }

            {!isLockedCursor &&
                <div className={`${"fixed bottom-4 z-100 h-14 w-full flex items-center justify-center"}`}>
                    <div className="w-2/3 h-full px-2 py-2 bg-white rounded-full flex flex-row gap-2">
                        <CursorContainer world={world} setIsLockedCursor={setIsLockedCursor} />
                        <BlockDetailsContainer modalType={modalType} setModalType={setModalType} usedBlocks={usedBlocks} world={world} />
                        <RemoveBlockContainer world={world} />
                        <SelectionBoxCoordsContainer state={[selectionCoords, setSelectionCoords]} world={world} />
                        <SeetingsBlock modalType={modalType} setModalType={setModalType} world={world} />
                        <ScreenCameraState world={world} />
                        <AddBlock world={world} />
                    </div>
                </div>
            }
            {isLockedCursor && <Cursor />}
            <Viewer isLockedCursor={isLockedCursor} onDestroy={() => setIsLockedCursor(false)} world={world} blocks={blocks} />
        </>
    )
}