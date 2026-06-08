import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Block from "./block";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import World from "@/app/entities/refocator-world";
import { Button } from "@/components/ui/button";
import { BoxSide } from "@/app/entities/refocator-world/block/entity";

type Props = {
    world: World;
}

const getOffsetBySide = (side: BoxSide): [number, number, number] => {
    switch (side) {
        case 'top':
            return [0, 1, 0];
        case 'bottom':
            return [0, -1, 0];
        case 'left':
            return [-1, 0, 0];
        case 'right':
            return [1, 0, 0];
        case 'front':
            return [0, 0, 1];
        case 'back':
            return [0, 0, -1];
    }
};

export default function AddBlock({ world }: Props) {

    const [blocks, setBlocks] = useState<string[]>([])
    const [block, setBlock] = useState<string | null>(null)
    const [mode, toggleMode] = useState<'add_block' | null>('add_block');
    const [open, setOpen] = useState(false)

    const getPath = (path: string | string[]) => {
        return '/block/' + (path ? Array.isArray(path) ? path[0] : path : '')
    }

    useEffect(() => {
        const unsub = world.subscribe('onClickBlock', (key, side) => {
            if (mode !== 'add_block' || !block) return;

            const [x, y, z] = key.split('-').map(Number);
            const [dx, dy, dz] = getOffsetBySide(side);

            world.addBlock(
                [x + dx, y + dy, z + dz],
                block,
                'block',
            );
        })

        return unsub
    }, [world]);

    useEffect(() => {
        const callback = async () => {
            try {
                const res = await world.getBlockList();
                setBlocks(res.files);
                setBlock(res.files[0]);
            } catch (e) {
                console.error('failed to get block list:', e)
            }
        }

        callback();
    }, [])

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-white ">
                    <DialogHeader>
                        <DialogTitle className="font-bold">Menu blocks:</DialogTitle>
                    </DialogHeader>
                    <div className="w-full gap-4 flex flex-row items-center flex-wrap h-150 overflow-y-scroll">
                        {blocks.map(block =>
                            <Block onClick={() => setBlock(block)} getPath={getPath} key={block} name={block} />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            <Button variant={"outline"} className={"size-10 rounded-full"} onClick={() => toggleMode(prev => prev === 'add_block' ? null : 'add_block')}>
                {mode === "add_block" ? <ActiveIcon /> : <Icon />}
            </Button>
            <button onClick={() => setOpen(prev => !prev)} className={cn("h-full size-10 rounded-[50%] flex items-center justify-center bg-slate-500 select-none")} >
                <img src={block ? getPath(block) : ''} />
            </button>
        </>
    )
}

function Icon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12H16" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M12 16V8" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>

    );
}
function ActiveIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM16 12.75H12.75V16C12.75 16.41 12.41 16.75 12 16.75C11.59 16.75 11.25 16.41 11.25 16V12.75H8C7.59 12.75 7.25 12.41 7.25 12C7.25 11.59 7.59 11.25 8 11.25H11.25V8C11.25 7.59 11.59 7.25 12 7.25C12.41 7.25 12.75 7.59 12.75 8V11.25H16C16.41 11.25 16.75 11.59 16.75 12C16.75 12.41 16.41 12.75 16 12.75Z" fill="#292D32" />
        </svg>
    )
}