export const sameBlockMaterialName = [
    'magenta_concrete',
    'mossy_cobblestone_slab',
    "mossy_stone_bricks",
    "mossy_cobblestone",
    "stone",
    "oak_leaves",
    "black_wool",
    "acacia_planks",
    'deepslate_bricks',
    "spruce_planks",
    "stone_bricks",
    "cobblestone",
    "jungle_leaves",
    "moss_block",
    "acacia_leaves",
    'white_concrete',
    "white_concrete_powder",
    'redstone_lamp',
    "bricks",
    "black_concrete"
]

const logs: Record<string, string | [string, string, string, string, string, string]> = {
    'stripped_spruce_wood': ["stripped_spruce_log.png", "stripped_spruce_log.png", "stripped_spruce_log_top.png", "stripped_spruce_log_top.png", "stripped_spruce_log.png", "stripped_spruce_log.png",],
    "spruce_log": ["spruce_log.png", "spruce_log.png", "spruce_log_top.png", "spruce_log_top.png", "spruce_log.png", "spruce_log.png",],
    'oak_wood': ["oak_log.png", "oak_log.png", "oak_log_top.png", "oak_log_top.png", "oak_log.png", "oak_log.png",],
    'stripped_spruce_log': ["stripped_spruce_log.png", "stripped_spruce_log.png", "stripped_spruce_log_top.png", "stripped_spruce_log_top.png", "stripped_spruce_log.png", "stripped_spruce_log",],
    "spruce_wood": "spruce_log.png",
    'acacia_wood': ["acacia_log.png", "acacia_log.png", "acacia_log_top.png", "acacia_log_top.png", "acacia_log.png", "acacia_log",],
    'cobblestone_stairs': 'cobblestone.png',
    'stone_stairs': 'stone.png',
    'mossy_cobblestone_stairs': 'mossy_cobblestone.png',
    'stone_brick_stairs': 'stone_bricks.png',
    'granite_stairs': 'granite.png',
    'brick_stairs': 'bricks.png',
    'andesite_stairs': 'andesite.png',
    'spruce_stairs': 'spruce_planks.png',
    'oak_stairs': 'oak_planks.png',
    'birch_stairs': 'birch_planks.png'
}

export const blockTextureMap: Record<string, string | [string, string, string, string, string, string]> = {
    ...logs,
    "grass_block": ["grass_block_side.png", "grass_block_side.png", "grass_block_top.png", "dirt.png", "grass_block_side.png", "grass_block_side.png",],
    "dirt": "dirt.png",
    "pink_wool": "pink_wool.png",
    "pink_carpet": "pink_wool.png",
    'cobblestone_wall': 'cobblestone_wall.png',
    "acacia_slab": "acacia_planks.png",
    "azalea": "flowering_azalea_leaves.png",
    'composter': ["composter_side.png", "composter_side.png", "composter_top.png", "composter_bottom.png", "composter_side.png", "composter_side.png",],
    'hay_block': ["hay_block_side.png", "hay_block_side.png", "hay_block_top.png", "hay_block_top.png", "hay_block_side.png", "hay_block_side.png",],
    'polished_granite_stairs': 'polished_granite.png'
};