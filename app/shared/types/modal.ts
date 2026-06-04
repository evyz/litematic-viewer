import { Dispatch, SetStateAction } from "react";

export type ModalType = "used_blocks" | "settings" | null

export type ModalStateProps = {
    modalType: ModalType;
    setModalType: Dispatch<SetStateAction<ModalType>>;
}

export type ModalProps = ModalStateProps & {
    onClose: () => void;
}