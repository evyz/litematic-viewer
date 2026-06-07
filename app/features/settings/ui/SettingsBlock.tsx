import SettingsButton from "./Button"
import SettingsModal from "./Block"
import { ModalStateProps } from "@/app/shared/types/modal"
import World from "@/app/entities/refocator-world";

type Props = ModalStateProps & {
    world: World;
}

export default function SeetingsBlock({ world, ...modalProps }: Props) {

    return (
        <>
            <SettingsButton {...modalProps} />
            <SettingsModal {...modalProps} onClose={() => modalProps.setModalType(null)} world={world} />
        </>
    )
}