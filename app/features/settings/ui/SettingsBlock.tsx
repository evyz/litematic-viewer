import SettingsButton from "./Button"
import SettingsModal from "./Block"
import World from "@/app/entities/world"
import { ModalStateProps } from "@/app/shared/types/modal"

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