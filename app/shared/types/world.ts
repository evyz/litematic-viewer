export type WorldEventMap = {
    onBlocksSetted: () => void;
    onFailedLoadTexture: (blockName: string, err: unknown) => void;
};