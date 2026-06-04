
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { ModalProps } from "@/app/shared/types/modal";
import World from "@/app/entities/world";

type Props = ModalProps & {
    usedBlocks: Record<string, number>;
    world: World;
}

export default function BlockDetailsModal({ modalType, onClose, usedBlocks, world }: Props) {
    return (
        <Dialog open={modalType === 'used_blocks'} onOpenChange={onClose}>
            <DialogContent className="bg-white ">
                <DialogHeader>
                    <DialogTitle className="font-bold">Used blocks in region:</DialogTitle>
                </DialogHeader>
                <div className="w-full gap-4 flex flex-row items-center flex-wrap h-150 overflow-y-scroll">
                    {Object.keys(usedBlocks).map(key => {
                        const meterial = world.getPath(key)

                        return (
                            <Card className="w-[140px] h-[200px] flex items-center bg-white" key={key}>
                                <Image width={120} height={120} src={`/block/${Array.isArray(meterial) ? meterial[0] : meterial}`} alt="" />
                                <CardTitle>{key} - {usedBlocks[key]}</CardTitle>
                            </Card>
                        )
                    })}
                </div>
            </DialogContent>
        </Dialog>
    )
}