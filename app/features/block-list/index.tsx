import { ModalStateProps } from "@/app/shared/types/modal";
import BlockListButton from "./ui/Button";
import World from "@/app/entities/refocator-world";
import Modal from "./ui/Modal";

type Props = ModalStateProps & {
    world: World
}

export default function BlockList({ ...props }: Props) {
    return (
        <>
            <Modal {...props} />
            <BlockListButton {...props} />
        </>
    )
}