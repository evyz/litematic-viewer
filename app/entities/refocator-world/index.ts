import * as THREE from 'three'
import { InputState } from '../world/input.state';
import { Block, Stairs, TrapDoor, Lantern } from './block';
import { BlockMeta } from '@/app/shared/types/block';
import { BoxSide } from './block/entity';
import { Slab } from './block/slab';
import { Plants } from './block/plants';
import { Events, Subscribe } from './events';
import { Wall } from './block/wall';
import { Sign } from './block/sign';
import { generateUUID } from 'three/src/math/MathUtils.js';

type WorldContext = {
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.WebGLRenderer;
};

type Classes = Block | Stairs | TrapDoor | Lantern | Slab | Plants | Wall | Sign;
THREE.Cache.enabled = true;

export default class World {


    scene?: THREE.Scene;
    camera?: THREE.Camera;
    renderer?: THREE.WebGLRenderer;

    input = new InputState();

    private yaw = 0;
    private pitch = 0;
    private sensivity = 0.002;
    speed = 10;
    private light: THREE.DirectionalLight | null = null
    private ambientLight: THREE.AmbientLight | null = null

    blocks: Map<string, Classes> = new Map()
    private textureLoader = new THREE.TextureLoader();

    private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();
    private blocksGroup = new THREE.Group()
    private events = new Events();

    constructor() {

        this.blocksGroup.name = "blocks";
    }


    attach(ctx: WorldContext) {
        this.scene = ctx.scene;
        this.camera = ctx.camera;
        this.renderer = ctx.renderer;

        this.light = new THREE.DirectionalLight("#ffffff", 2);
        this.light.position.set(10, 20, 10);
        this.scene.add(this.light);

        this.ambientLight = new THREE.AmbientLight("#ffffff", 1);
        this.scene.add(this.ambientLight);

        if (this.blocks.size) {
            this.scene.add(...this.blocks.values().map(block => block?.mesh ?? new THREE.Mesh()));
        }
        this.renderer.domElement.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("click", this.onClick);

        this.renderer.domElement.addEventListener("mousedown", this.onMouseDown);
        this.renderer.domElement.addEventListener("mouseup", this.onMouseUp);
    }


    detach() {

        const objs: THREE.Object3D<THREE.Object3DEventMap>[] = []
        if (this.light) { objs.push(this.light) }
        if (this.ambientLight) { objs.push(this.ambientLight) }
        this.scene?.remove(...objs)

        this.renderer?.domElement.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener('click', this.onClick);

        this.renderer?.domElement.removeEventListener("mousedown", this.onMouseDown);
        this.renderer?.domElement.removeEventListener("mouseup", this.onMouseUp);

        this.scene?.remove(this.blocksGroup);

        this.scene = undefined;
        this.camera = undefined;
        this.renderer = undefined;
    }

    setSpeed(speed: number) {
        if (speed < 1 || speed > 99) { throw new Error('Validation failed: speed limit 1 - 99') }
        this.speed = speed;
        this.events.emit('onChangeSpeed', speed)
    }

    async getBlockList(): Promise<{ directories: string[], files: string[] }> {
        const file = await fetch(`/block/_list.json`)
        return await file.json()
    }

    private normalToSide(normal: THREE.Vector3): BoxSide {
        const absX = Math.abs(normal.x);
        const absY = Math.abs(normal.y);
        const absZ = Math.abs(normal.z);

        if (absY >= absX && absY >= absZ) {
            return normal.y > 0 ? 'top' : 'bottom';
        }

        if (absX >= absY && absX >= absZ) {
            return normal.x > 0 ? 'right' : 'left';
        }

        return normal.z > 0 ? 'front' : 'back';
    }

    private onClick = async (event: MouseEvent) => {
        const hit = this.getIntersectionHit(event);

        if (!hit || hit.instanceId == null || !hit.face) return;

        const mesh = hit.object as THREE.InstancedMesh;
        const block = mesh.userData.blocks?.[hit.instanceId];

        if (!block) return;

        const normal = hit.face.normal.clone();

        const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
        normal.applyNormalMatrix(normalMatrix).normalize();

        const side = this.normalToSide(normal);

        this.events.emit('onClickBlock', block.getRenderKey(), side);
    };

    getTexturePath = (key: string) => {
        const block = this.blocks.get(key)
        return block?.getPathTexture()
    }

    addBlock([x, y, z]: [number, number, number], name: string, type: BlockMeta['type']) {
        const key = this.getKey(x, y, z);

        if (this.blocks.has(key)) {
            return;
        }

        const meta: BlockMeta = {
            id: generateUUID(),
            x,
            y,
            z,
            name,
            type,
        };

        const nextMetaBlocks: Record<string, BlockMeta> = {};

        for (const [key, block] of this.blocks) {
            const { x, y, z, name, type } = block.meta
            nextMetaBlocks[key] = {
                id: block.id,
                x: x,
                y: y,
                z: z,
                name: name,
                type: type,
            };
        }

        nextMetaBlocks[key] = meta;

        this.blocks.clear();
        this.setBlocks(nextMetaBlocks);
        console.log(meta)
    }

    private getIntersectionHit(event: MouseEvent) {
        if (!this.renderer || !this.camera) return;

        const rect = this.renderer.domElement.getBoundingClientRect();

        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(
            this.blocksGroup.children,
            true,
        );

        return intersects[0];
    }

    private onMouseDown = (event: MouseEvent) => {
        if (event.button !== 0) return;
    };


    private onMouseMove = (event: MouseEvent) => {

    }

    private onMouseUp = (event: MouseEvent) => {

    };

    private spawnBlock(meta: BlockMeta) {
        switch (meta.type) {
            case 'block': {
                return new Block(meta, this.textureLoader, this.events);
            }
            case "trapdoor": {
                return new TrapDoor(meta, this.textureLoader, this.events);
            }
            case "lantern": {
                return new Lantern(meta, this.textureLoader, this.events);
            }
            case 'slab': {
                return new Slab(meta, this.textureLoader, this.events);
            }
            case 'plants': {
                return new Plants(meta, this.textureLoader, this.events);
            }
            case 'wall': {
                return new Wall(meta, this.textureLoader, this.events)
            }
            case 'sign': {
                return new Sign(meta, this.textureLoader, this.events)
            }
            default: {
                return new Stairs(meta, this.textureLoader, this.events)
            }
        }
    }


    private getKey = (x: number, y: number, z: number) => `${x}-${y}-${z}`;

    setBlocks(metaBlocks: Record<string, BlockMeta>) {
        this.events.emit('onStartLoadBlocks');
        this.blocksGroup.clear();

        const groups = new Map<string, Array<Block | Stairs | TrapDoor | Lantern | Slab | Plants | Wall | Sign>>();

        const keys = Object.keys(metaBlocks)
        let count = 0

        for (const key of keys) {
            const meta = metaBlocks[key];
            const block = this.spawnBlock(meta)

            const [x, y, z] = key.split('-').map(Number)
            const top = metaBlocks[this.getKey(x, y + 1, z)]
            const bottom = metaBlocks[this.getKey(x, y - 1, z)]
            const left = metaBlocks[this.getKey(x - 1, y, z)]
            const right = metaBlocks[this.getKey(x + 1, y, z)]
            const front = metaBlocks[this.getKey(x, y, z + 1)]
            const back = metaBlocks[this.getKey(x, y, z - 1)]

            const sides: BoxSide[] = []
            if (top && top.type === 'block') {
                sides.push('top')
            }
            if (bottom && bottom.type === 'block') {
                sides.push('bottom')
            }
            if (left && left.type === 'block') {
                sides.push('left')
            }
            if (right && right.type === 'block') {
                sides.push('right')
            }
            if (front && front.type === 'block') {
                sides.push('front')
            }
            if (back && back.type === 'block') {
                sides.push('back')
            }

            // fix hidding sideBoxes
            // block.hideBoxSides(sides);

            const geometry = block.createGeometry()
            const material = block.applyMaterial();

            const mesh = new THREE.Mesh(
                geometry,
                material,
            );

            block.applyTransform(mesh);

            mesh.updateMatrix();
            block.setMesh(mesh);

            const instanceKey = [
                meta.type,
                meta.name,
                sides.sort().join(',')
            ].join('|');

            const group = groups.get(instanceKey) ?? [];
            group.push(block);
            groups.set(instanceKey, group);


            this.blocks.set(block.getRenderKey(), block);
            this.events.emit('progressSettingBlocks', count, keys.length)
            count++
        }

        for (const [_, blocks] of groups) {
            const firstBlock = blocks[0];

            const geometry = firstBlock.createGeometry();
            const material = firstBlock.applyMaterial();

            const instancedMesh = new THREE.InstancedMesh(
                geometry,
                material,
                blocks.length
            );

            instancedMesh.userData.blocks = blocks;

            const dummy = new THREE.Object3D();

            blocks.forEach((block, index) => {
                block.applyTransform(dummy);
                dummy.updateMatrix();

                instancedMesh.setMatrixAt(index, dummy.matrix);

                block.setMesh(instancedMesh);
            });

            instancedMesh.instanceMatrix.needsUpdate = true;

            this.blocksGroup.add(instancedMesh);
        }

        this.scene?.add(this.blocksGroup);
        this.events.emit('onBlocksSetted');
    }

    private moveCamera() {
        if (!this.camera) { return }
        this.yaw -= this.input.look.x * this.sensivity;
        this.pitch -= this.input.look.y * this.sensivity;

        const maxPitch = Math.PI / 2 - 0.01;

        this.pitch = THREE.MathUtils.clamp(
            this.pitch,
            -maxPitch,
            maxPitch,
        );

        this.camera.rotation.order = "YXZ";

        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;
        this.camera.rotation.z = 0;

        this.input.look.x = 0;
        this.input.look.y = 0;
    }

    tick(delta: number) {
        if (!this.camera) return;

        this.moveCamera();

        const speed = this.speed * delta;

        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, this.camera.up).normalize();

        const movement = new THREE.Vector3();

        movement
            .addScaledVector(right, this.input.move.x)
            .addScaledVector(forward, this.input.move.z);

        if (movement.lengthSq() > 0) {
            movement.normalize();
        }

        this.camera.position.addScaledVector(movement, speed);
        this.camera.position.y += this.input.move.y * speed;
    }

    subscribe: Subscribe = this.events.subscribe;
}