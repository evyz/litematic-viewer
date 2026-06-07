import World from "@/app/entities/refocator-world"
import { ModalStateProps } from "@/app/shared/types/modal"
import { Card, CardTitle } from "@/components/ui/card"
import { DialogContent, DialogHeader, DialogTitle, Dialog } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"
import { useEffect, useState } from "react"

type Props = ModalStateProps & {
    world: World
}

export default function Modal({ modalType, setModalType, world }: Props) {

    const [res, setRes] = useState<string[]>([])

    useEffect(() => {
        const callback = async () => {
            try {
                const data = await world.getBlockList()
                setRes(data.files)
            } catch (e) {
                console.error('failed to fetch block list:', e)
            }
        }

        callback()
    }, [])

    const Content =
        <>
            {res.map(str =>
                <Tooltip key={str}>
                    <TooltipTrigger>
                        <Image loading="lazy" width={16} height={16} src={`/block/${str}`} alt={str} className="size-10" />
                    </TooltipTrigger>
                    <TooltipContent>
                        {str}
                    </TooltipContent>
                </Tooltip>
            )}
        </>


    return (
        <Dialog open={modalType === 'block_list'} onOpenChange={() => setModalType(null)}>
            <DialogContent className="bg-white sm:max-w-2/3">
                <DialogHeader>
                    <DialogTitle className="font-bold">Menu blocks:</DialogTitle>
                </DialogHeader>
                <Card className="max-h-100 overflow-y-scroll flex flex-row flex-wrap gap-2">
                    {Content}
                </Card>
            </DialogContent>
        </Dialog>
    )
}