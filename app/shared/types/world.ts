import { BoxSide } from "@/app/entities/refocator-world/block/entity";

export type WorldEventMap = {
    onBlocksSetted: () => void;
    onFailedLoadTexture: (blockName: string, err: unknown) => void;
    progressSettingBlocks: (current: number, total: number) => void;
    onStartLoadBlocks: () => void;
    onClickBlock: (key: string, side: BoxSide) => void;
    onChangeSpeed: (speed: number) => void
};