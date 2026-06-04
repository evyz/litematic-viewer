export type BlockDirection = 'north' | 'south' | 'west' | 'east';

export type StairShape =
    | 'straight'
    | 'inner_left'
    | 'inner_right'
    | 'outer_left'
    | 'outer_right';


export type Block = {
    x: number;
    y: number;
    z: number;

    name: string;
    id: string;

    type: 'block' | 'stairs' | 'trapdoor' | "lantern" | "slab",

    state?: {
        facing?: BlockDirection;

        half?: 'top' | 'bottom';

        shape?: StairShape;

        waterlogged?: boolean;

        open?: boolean;
        powered?: boolean;
        hanging?: boolean;

        axis?: "x" | "y" | "z"
        type?: 'top' | 'bottom'
    };
};

export type BlockMeta = Block