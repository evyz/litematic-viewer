import { BlockMeta } from "../types/block"

export const getBlockType = (name: string, ...args: unknown[]): BlockMeta['type'] => {
    if (name.includes("sign")) {
        console.log(args);
    }
    return name.includes('_stairs') ? "stairs"
        : name.includes('_trapdoor') ? "trapdoor"
            : name.includes("lantern") ? 'lantern' :
                name.includes("slab") ? 'slab' :
                    name.includes("wall") ? 'wall' :
                        name.includes("sign") ? 'sign' :
                            name.includes("bush") || name.includes("mushroom") ? 'plants' :
                                'block'
} 