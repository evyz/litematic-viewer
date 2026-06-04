import * as THREE from 'three'
import { InputState } from '../world/input.state';
import { Block, Stairs, TrapDoor, Lantern } from './block';
import { BlockMeta } from '@/app/shared/types/block';
import { Material } from './material';

type WorldContext = {
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.WebGLRenderer;
};


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

    blocks: Map<string, Block | Stairs | TrapDoor | Lantern> = new Map()
    private material = new Material();
    private textureLoader = new THREE.TextureLoader();

    constructor() {
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

        this.renderer.domElement.addEventListener("mousedown", this.onMouseDown);
        this.renderer.domElement.addEventListener("mouseup", this.onMouseUp);
    }


    detach() {

        const objs: THREE.Object3D<THREE.Object3DEventMap>[] = []
        if (this.light) { objs.push(this.light) }
        if (this.ambientLight) { objs.push(this.ambientLight) }
        this.scene?.remove(...objs)

        this.renderer?.domElement.removeEventListener("mousemove", this.onMouseMove);

        this.renderer?.domElement.removeEventListener("mousedown", this.onMouseDown);
        this.renderer?.domElement.removeEventListener("mouseup", this.onMouseUp);

        this.scene = undefined;
        this.camera = undefined;
        this.renderer = undefined;
    }

    private onMouseDown = (event: MouseEvent) => {
        if (event.button !== 0) return;
    };


    private onMouseMove = (event: MouseEvent) => {

    }

    private onMouseUp = (event: MouseEvent) => {

    };

    private spawnBlock(meta: BlockMeta) {
        if (meta.type === 'block') {
            return new Block(meta);
        }

        if (meta.type === "trapdoor") {
            return new TrapDoor(meta);
        }

        if (meta.type === "lantern") {
            return new Lantern(meta);
        }

        return new Stairs(meta)
    }

    setBlocks(metaBlocks: BlockMeta[]) {

        for (const meta of metaBlocks) {
            const block = this.spawnBlock(meta)
            const geometry = block.createGeometry()
            const material = block.applyMaterial(this.textureLoader);

            const mesh = new THREE.Mesh(
                geometry,
                material,
            );

            block.applyTransform(mesh);

            mesh.updateMatrix();
            block.setMesh(mesh);

            this.blocks.set(block.getRenderKey(), block);
            this.scene?.add(mesh);
        }
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
}