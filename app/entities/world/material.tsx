import * as THREE from "three";
import { blockTextureMap, sameBlockMaterialName } from "./material.consts";


export class Material {
    private textureLoader = new THREE.TextureLoader();

    constructor() { }

    private sameBlocksNameMap: Set<string> = new Set(sameBlockMaterialName)

    private blockTextureMap = blockTextureMap

    private transparentBlocks: Record<string, string> = {
        "grass": "short_grass.png",
    }

    private slabs: Record<string, string> = {
        "cobblestone_slab": "cobblestone.png",
        "pink_stained_glass_pane": "pink_stained_glass.png"
    }

    private pads: Record<string, string | [string, string, string, string, string, string]> = {
        'lily_pad': ['', '', 'lily_pad.png', '', '', '']
    }

    private latterns: Record<string, string | [string, string, string, string, string, string]> = {
        'soul_lantern': 'soul_lantern.png'
    }

    private plants: Record<string, string | [string, string, string, string, string, string]> = {
        'big_dripleaf': 'big_dripleaf_top.png'
    }

    private fire: Record<string, string | [string, string, string, string, string, string]> = {
        'soul_campfire': ['campfire_log.png', 'campfire_log.png', 'soul_campfire_log_lit_sprite_1.png', 'campfire_log.png', 'campfire_log.png', 'campfire_log.png']
    }

    materialCache = new Map<string, THREE.MeshStandardMaterial>();

    loadMaterial(path: string) {
        return this.textureLoader.load(path);
    }

    getBlocksList() {
        return Object.keys({ ...this.sameBlocksNameMap, ...blockTextureMap, ...this.latterns, ...this.plants });
    }

    getPath(name: string) {
        const sameBlock = this.sameBlocksNameMap.has(name);
        if (sameBlock) {
            return name + '.png'
        }

        const textureName = this.blockTextureMap[name];
        if (textureName) {
            return textureName;
        }

        const transperentName = this.transparentBlocks[name];
        if (transperentName) {
            return transperentName
        }

        const slabName = this.slabs[name];
        if (slabName) {
            return slabName
        }

        const padName = this.pads[name];
        if (padName) {
            return padName
        }

        const latternName = this.latterns[name];
        if (latternName) {
            return latternName
        }

        const plantsName = this.plants[name];
        if (plantsName) {
            return plantsName
        }

        if (this.fire[name]) {
            return this.fire[name]
        }

        return null
    }
}