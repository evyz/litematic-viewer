import { ModalStateProps } from "@/app/shared/types/modal";
import BlockListButton from "./ui/Button";
import World from "@/app/entities/refocator-world";
import Modal from "./ui/Modal";
import { Dispatch, SetStateAction } from "react";

type Props = ModalStateProps & {
    world: World;
    setBlocks: Dispatch<SetStateAction<string[]>>
    blocks: string[];
    setBlock: Dispatch<SetStateAction<string | null>>
}

export default function BlockList({ ...props }: Props) {
    return (
        <>
            <Modal {...props} />
            <BlockListButton {...props} />
        </>
    )
}