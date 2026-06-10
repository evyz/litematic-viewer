import World from "@/app/entities/refocator-world"
import { ModalStateProps } from "@/app/shared/types/modal"
import { DialogContent, DialogHeader, DialogTitle, Dialog } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useVirtualizer } from "@tanstack/react-virtual"
import Image from "next/image"
import { Dispatch, SetStateAction, useEffect, useRef } from "react"

type Props = ModalStateProps & {
    world: World;
    setBlocks: Dispatch<SetStateAction<string[]>>
    blocks: string[]
    setBlock: Dispatch<SetStateAction<string | null>>
}

export default function Modal({ modalType, setModalType, world, blocks, setBlocks, setBlock }: Props) {
    const parentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (modalType !== 'block_list') return;

        world.getBlockList()
            .then(data => setBlocks(data.files))
            .catch(e => console.error('failed to fetch block list:', e));
    }, [modalType, setBlocks, world]);

    const columns = 16;
    const rows = Math.ceil(blocks.length / columns);

    // eslint-disable-next-line react-hooks/incompatible-library
    const virtualizer = useVirtualizer({
        count: rows,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 56,
        overscan: 6,
    });

    return (
        <Dialog open={modalType === 'block_list'} onOpenChange={() => setModalType(null)}>
            <DialogContent className="bg-white sm:max-w-2/3">
                <DialogHeader>
                    <DialogTitle className="font-bold">Menu blocks:</DialogTitle>
                </DialogHeader>

                <div ref={parentRef} className="h-[400px] overflow-y-auto">
                    <div
                        style={{
                            height: virtualizer.getTotalSize(),
                            position: 'relative',
                        }}
                    >
                        {virtualizer.getVirtualItems().map(row => {
                            const rowBlocks = blocks.slice(row.index * columns, row.index * columns + columns);

                            return (
                                <div
                                    key={row.key}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        transform: `translateY(${row.start}px)`,
                                    }}
                                    className="flex gap-2"
                                >
                                    {rowBlocks.map(str => (
                                        <Tooltip key={str}>
                                            <TooltipTrigger asChild>
                                                <button onClick={() => setBlock(prev => prev === str ? null : str)} type="button" className="size-10">
                                                    <Image
                                                        width={40}
                                                        height={40}
                                                        src={`/block/${str}`}
                                                        alt={str}
                                                        className="size-10"
                                                    />
                                                </button>
                                            </TooltipTrigger>

                                            <TooltipContent>{str}</TooltipContent>
                                        </Tooltip>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}