import { ModalStateProps } from "@/app/shared/types/modal"
import BlockDetailsMenuButton from "./ui/menu-button"
import BlockDetailsModal from "./ui/modal"
import World from "@/app/entities/world";

type Props = ModalStateProps & {
    usedBlocks: Record<string, number>;
    world: World;
}

export default function BlockDetailsContainer(props: Props) {
    return (
        <>
            <BlockDetailsMenuButton {...props} />
            <BlockDetailsModal {...props} onClose={() => props.setModalType(null)} />
        </>
    )
}