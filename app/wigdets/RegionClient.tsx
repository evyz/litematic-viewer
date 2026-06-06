"use client";

import { useEffect, useRef, useState } from "react";
import { parse } from "prismarine-nbt";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { decodeBlockStates } from "../utils/decodeBlocks";
import RegionScene from "./RegionScene";
import { generateUUID } from "three/src/math/MathUtils.js";
import { BlockMeta } from "../shared/types/block";
import RegionScene2 from "./RegionScene2";
import { getBlockType } from "../shared/utils/getBlockType";

const textureLoader = new THREE.TextureLoader();

const blockTextureMap: Record<string, string | [string, string, string, string, string, string]> = {
    "minecraft:grass_block": ["grass_block_side.png", "grass_block_side.png", "grass_block_top.png", "dirt.png", "grass_block_side.png", "grass_block_side.png",],
    "minecraft:spruce_wood": "spruce_log.png",
    "minecraft:dirt": "dirt.png",
    "minecraft:pink_wool": "pink_wool.png",
    "minecraft:pink_carpet": "pink_wool.png",
    "minecraft:magenta_concrete": "magenta_concrete.png",
    "minecraft:mossy_cobblestone_slab": "mossy_cobblestone.png",
};

const transparentBlocks: Record<string, string> = {
    "minecraft:grass": "short_grass.png",
}

const slabs: Record<string, string> = {
    "minecraft:cobblestone_slab": "cobblestone.png",
    "minecraft:pink_stained_glass_pane": "pink_stained_glass.png"
}

const pads: Record<string, string | [string, string, string, string, string, string]> = {
    'minecraft:lily_pad': ['', '', 'lily_pad.png', '', '', '']
}

const latterns: Record<string, string | [string, string, string, string, string, string]> = {
    'minecraft:soul_lantern': 'soul_lantern.png'
}

const plants: Record<string, string | [string, string, string, string, string, string]> = {
    'minecraft:big_dripleaf': 'big_dripleaf_top.png'
}

const fire: Record<string, string | [string, string, string, string, string, string]> = {
    'minecraft:soul_campfire': ['campfire_log.png', 'campfire_log.png', 'soul_campfire_log_lit_sprite_1.png', 'campfire_log.png', 'campfire_log.png', 'campfire_log.png']
}

const materialCache = new Map<string, THREE.MeshStandardMaterial>();

const getPath = (name: string) => {
    const textureName = blockTextureMap[name];

    if (textureName) {
        return textureName;
    }

    const transperentName = transparentBlocks[name];
    if (transperentName) {
        return transperentName
    }

    const slabName = slabs[name];
    if (slabName) {
        return slabName
    }

    const padName = pads[name];
    if (padName) {
        return padName
    }

    const latternName = latterns[name];
    if (latternName) {
        return latternName
    }

    const plantsName = plants[name];
    if (plantsName) {
        return plantsName
    }

    if (fire[name]) {
        return fire[name]
    }

    return null
}

const getMaterial = async (name: string) => {
    const textureName = getPath(name)

    if (!textureName) {
        console.log(name);

        const fallback = new THREE.MeshStandardMaterial({
            color: "#aaaaaa",
        });

        materialCache.set(name, fallback);
        return fallback;
    }

    if (Array.isArray(textureName)) {
        const loadTexture = (path: string) => {
            const texture = textureLoader.load(`/block/${path}`);

            texture.colorSpace = THREE.SRGBColorSpace;
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            texture.generateMipmaps = false;

            return texture;
        };

        return textureName.map(path => {
            return new THREE.MeshStandardMaterial({
                map: loadTexture(path),
            });
        });
    }

    const texture = textureLoader.load(`/block/${textureName}`);

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;

    const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.1,
    });

    materialCache.set(name, material);

    return material;
};

async function renderBlocks(container: HTMLDivElement, blocks: BlockMeta[]) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#111111");

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(16, 14, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const light = new THREE.DirectionalLight("#ffffff", 2);
    light.position.set(10, 20, 10);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight("#ffffff", 1);
    scene.add(ambientLight);

    const blocksByName = Object.groupBy(blocks, block => block.name);

    const dummy = new THREE.Object3D();

    for (const [name, typedBlocks] of Object.entries(blocksByName)) {
        if (!typedBlocks?.length) continue;

        const material = await getMaterial(name);

        let height = 1;
        let diff = 0;
        if (name.includes("slab")) {
            height = 0.5;
            diff = 0.5;
        }
        if (name.includes("pad")) {
            height = 0.1;
            diff = 1 - 0.3;
        }
        let geometry = new THREE.BoxGeometry(1, height, 1);

        if (name === "minecraft:soul_lantern") {
            geometry = new THREE.BoxGeometry(0.6, 0.8, 0.6);
        }

        const mesh = new THREE.InstancedMesh(
            geometry,
            material,
            typedBlocks.length
        );

        typedBlocks.forEach((block, index) => {
            dummy.position.set(block.x, block.y - diff, block.z);
            dummy.updateMatrix();
            mesh.setMatrixAt(index, dummy.matrix);
        });

        mesh.instanceMatrix.needsUpdate = true;
        scene.add(mesh);
    }

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());

    controls.target.copy(center);
    controls.update();

    const animate = () => {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    animate();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerMove = (event: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();

        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);

        const intersects = raycaster.intersectObjects(scene.children, true);

        const hit = intersects.find(item => item.object instanceof THREE.InstancedMesh);

        if (!hit) return;

        const mesh = hit.object as THREE.InstancedMesh;

        console.log("hit", {
            mesh,
            instanceId: hit.instanceId,
            point: hit.point,
            face: hit.face,
        });
    };

    renderer.domElement.addEventListener("pointermove", onPointerMove);

    return () => {
        renderer.dispose();
        container.removeChild(renderer.domElement);
    };
}

export default function RegionClient({ slug }: { slug: string }) {
    const viewerRef = useRef<HTMLDivElement | null>(null);
    const [blocks, setBlocks] = useState<Record<string, BlockMeta>>({})
    const [usedBlocks, setUsedBlocks] = useState<Record<string, number>>({});

    useEffect(() => {
        let disposed = false;
        let cleanup: (() => void) | undefined;

        const callback = async () => {
            const req = await fetch(`/mock/${slug}.litematic`);
            const blob = await req.blob();
            const buffer = await blob.arrayBuffer();

            const parsed = await parse(Buffer.from(buffer));

            console.log(parsed.parsed.value);

            const region = parsed?.parsed?.value?.Regions.value?.Unnamed.value;

            const palette = region.BlockStatePalette.value.value;
            const blockStates = region.BlockStates.value;
            const size = region.Size.value;

            const totalBlocks =
                Math.abs(size.x.value) *
                Math.abs(size.y.value) *
                Math.abs(size.z.value);

            const bitsPerBlock = Math.max(2, Math.ceil(Math.log2(palette.length)));

            const indices = decodeBlockStates(blockStates, bitsPerBlock, totalBlocks);

            const blocks: Record<string, BlockMeta> = {};

            let index = 0;

            const usedBlocks: Record<string, number> = {}

            for (let y = 0; y < Math.abs(size.y.value); y++) {
                for (let z = 0; z < Math.abs(size.z.value); z++) {
                    for (let x = 0; x < Math.abs(size.x.value); x++) {
                        const paletteIndex = indices[index];
                        const block = palette[paletteIndex];
                        const name = block.Name.value;

                        usedBlocks[name] = (usedBlocks[name] ?? 0) + 1


                        if (name !== "minecraft:air") {

                            const properties = block.Properties?.value;
                            const meta: BlockMeta = {
                                x,
                                y,
                                z,
                                name,
                                id: generateUUID(),

                                type: getBlockType(name, properties),

                                state: properties
                                    ? {
                                        facing: properties.facing?.value,
                                        half: properties.half?.value,
                                        shape: properties.shape?.value,
                                        waterlogged: properties.waterlogged?.value === 'true',
                                        axis: properties?.axis?.value,
                                        open: properties?.open?.value === "true",
                                        powered: properties?.powered?.value === "true",
                                        hanging: properties?.hanging?.value === "true",
                                        type: properties?.type?.value
                                    }
                                    : undefined,
                            }

                            blocks[`${x}-${y}-${z}`] = meta
                        }

                        index++;
                    }
                }
            }

            setUsedBlocks(usedBlocks);
            setBlocks(blocks);
            if (disposed || !viewerRef.current) return;

            // cleanup = await renderBlocks(viewerRef.current, blocks);
        };

        callback();

        return () => {
            disposed = true;
            cleanup?.();
        };
    }, [slug]);

    return (
        <RegionScene2 blocks={blocks} />
    )

    return (
        <RegionScene blocks={blocks} usedBlocks={usedBlocks} />
    )
}