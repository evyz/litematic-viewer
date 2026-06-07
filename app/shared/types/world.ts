export type WorldEventMap = {
    onBlocksSetted: () => void;
    onFailedLoadTexture: (blockName: string, err: unknown) => void;
    progressSettingBlocks: (current: number, total: number) => void;
    onStartLoadBlocks: () => void;
    onClickBlock: (key: string) => void;
    onChangeSpeed: (speed: number) => void
};