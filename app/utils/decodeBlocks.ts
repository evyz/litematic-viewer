export function decodeBlockStates(
    longs: [number, number][],
    bitsPerBlock: number,
    totalBlocks: number
) {
    const indices: number[] = [];

    const mask = (1 << bitsPerBlock) - 1;

    let bitIndex = 0;

    for (let i = 0; i < totalBlocks; i++) {
        const longIndex = Math.floor(bitIndex / 64);
        const startBit = bitIndex % 64;

        const [high, low] = longs[longIndex];

        const value =
            (BigInt(high >>> 0) << 32n) |
            BigInt(low >>> 0);

        const paletteIndex =
            Number((value >> BigInt(startBit)) & BigInt(mask));

        indices.push(paletteIndex);

        bitIndex += bitsPerBlock;
    }

    return indices;
}