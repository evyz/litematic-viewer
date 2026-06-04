import * as THREE from "three";
import { InputState } from "./input.state";
import { Material } from "./material";
import { Mode } from "@/app/shared/types/mode";
import { Block } from "@/app/shared/types/block";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { Events, Subscribe } from "./events";

type WorldContext = {
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.WebGLRenderer;
};

type Config = {
    sensivity?: number;
    yaw?: number;
    pitch?: number;
    speed?: number;
    hideInnerBlocks?: boolean;
}

type InstansedClientMesh = THREE.InstancedMesh & {
    cid: string;
}

type CameraState = {
    position: [number, number, number];
    target: [number, number, number];
};

class World {
    scene?: THREE.Scene;
    camera?: THREE.Camera;
    renderer?: THREE.WebGLRenderer;
    mode: Mode = null;

    private material = new Material();
    input = new InputState();

    private blocks: Block[] = [];
    private blocksGroup = new THREE.Group();

    private yaw = 0;
    private pitch = 0;
    private sensivity = 0.002;
    speed = 10;
    private light: THREE.DirectionalLight | null = null
    private ambientLight: THREE.AmbientLight | null = null
    private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();
    private hideInnerBlocks = false;

    hoveredBlock: THREE.Intersection<THREE.Object3D> | null = null;
    private hoveredInstance: {
        mesh: THREE.InstancedMesh;
        instanceId: number;
        originalMatrix: THREE.Matrix4;
    } | null = null;
    hoveredFaceNormal: THREE.Vector3 | null = null;

    private selectionStart: THREE.Intersection<THREE.Object3D> | null = null;
    private selectionEnd: THREE.Intersection<THREE.Object3D> | null = null;
    private isSelectingRegion = false;

    private selectionBox: THREE.LineSegments | null = null;
    private events = new Events();

    constructor({ sensivity, speed, hideInnerBlocks }: Config) {
        if (sensivity) this.sensivity = sensivity;
        if (speed) this.speed = speed;

        if (hideInnerBlocks) this.hideInnerBlocks = hideInnerBlocks

        this.blocksGroup.name = "blocks";
    }

    private selectedBlockName = "minecraft:stone";

    /**
     * @returns unsub method for demount state component
     */
    subscribe: Subscribe = this.events.subscribe;

    setMode(mode: Mode) {
        this.mode = mode;
        this.events.emit('change_mode', mode);
    }

    setSelectedBlockName(name: string) {
        this.selectedBlockName = name;
        this.events.emit('change_selected_block', name)
    }

    getSelectedBlockName() {
        return this.selectedBlockName;
    }

    setSpeed(speed: number) {
        this.speed = speed;
        this.events.emit('change_speed', speed);
    }

    getBlockList = this.material.getBlocksList

    attach(ctx: WorldContext) {
        this.scene = ctx.scene;
        this.camera = ctx.camera;
        this.renderer = ctx.renderer;

        this.light = new THREE.DirectionalLight("#ffffff", 2);
        this.light.position.set(10, 20, 10);
        this.scene.add(this.light);

        this.ambientLight = new THREE.AmbientLight("#ffffff", 1);
        this.scene.add(this.ambientLight);

        this.scene.add(this.blocksGroup);
        this.renderer.domElement.addEventListener("mousemove", this.onMouseMove);
        this.renderer.domElement.addEventListener("click", this.onClick);

        this.renderer.domElement.addEventListener("mousedown", this.onMouseDown);
        this.renderer.domElement.addEventListener("mouseup", this.onMouseUp);
    }

    detach() {

        const objs: THREE.Object3D<THREE.Object3DEventMap>[] = []
        if (this.light) { objs.push(this.light) }
        if (this.ambientLight) { objs.push(this.ambientLight) }
        this.scene?.remove(...objs)

        this.renderer?.domElement.removeEventListener("mousemove", this.onMouseMove);
        this.renderer?.domElement.removeEventListener("click", this.onClick);

        this.renderer?.domElement.removeEventListener("mousedown", this.onMouseDown);
        this.renderer?.domElement.removeEventListener("mouseup", this.onMouseUp);

        this.scene = undefined;
        this.camera = undefined;
        this.renderer = undefined;
    }

    setCameraState(state: CameraState) {
        if (!this.camera) return;

        this.camera.position.fromArray(state.position);

        const target = new THREE.Vector3().fromArray(state.target);
        this.camera.lookAt(target);

        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);

        this.yaw = Math.atan2(-direction.x, -direction.z);
        this.pitch = Math.asin(direction.y);
    }


    getCameraState() {
        if (!this.camera) {
            return null;
        }

        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);

        return {
            position: this.camera.position.toArray(),
            direction: direction.toArray(),
        };
    }

    getPath(path: string) {
        return this.material.getPath(path);
    }

    private getSelectionBoxBounds() {
        if (!this.selectionBox) return null;

        return new THREE.Box3().setFromObject(this.selectionBox);
    }

    private async rebuildMeshesByNames(names: Set<string>) {
        const dummy = new THREE.Object3D();

        const nextMeshes: THREE.InstancedMesh[] = [];

        for (const name of names) {
            const typedBlocks = this.blocks.filter(block => block.name === name);

            if (!typedBlocks.length) continue;

            const material = await this.getMaterial(name);

            const geometry = new THREE.BoxGeometry(1, 1, 1);

            const mesh = new THREE.InstancedMesh(
                geometry,
                material,
                typedBlocks.length,
            );

            typedBlocks.forEach((block, index) => {
                dummy.position.set(block.x, block.y, block.z);
                dummy.updateMatrix();
                mesh.setMatrixAt(index, dummy.matrix);
            });

            mesh.instanceMatrix.needsUpdate = true;
            mesh.name = name;

            nextMeshes.push(mesh);
        }

        const oldMeshes = this.blocksGroup.children.filter(child =>
            names.has(child.name),
        );

        this.blocksGroup.remove(...oldMeshes);

        this.blocksGroup.add(...nextMeshes);

        for (const child of oldMeshes) {
            if (child instanceof THREE.InstancedMesh) {
                child.geometry.dispose();
            }
        }
    }

    async replace(rules: Record<string, string>) {
        const selectedBounds = this.getSelectionBoxBounds();
        if (!selectedBounds) return;

        const touchedNames = new Set<string>();

        this.blocks = this.blocks.map(block => {
            const isInside = selectedBounds.containsPoint(
                new THREE.Vector3(block.x, block.y, block.z),
            );

            if (!isInside) return block;

            const nextName = rules[block.name] ?? rules["*"];

            if (!nextName) return block;

            touchedNames.add(block.name);
            touchedNames.add(nextName);

            return {
                ...block,
                name: nextName,
            };
        });

        await this.rebuildMeshesByNames(touchedNames);
    }

    private disposeSelectionBox() {
        if (!this.selectionBox) return;

        this.scene?.remove(this.selectionBox);
        this.selectionBox.geometry.dispose();

        if (Array.isArray(this.selectionBox.material)) {
            this.selectionBox.material.forEach(material => material.dispose());
        } else {
            this.selectionBox.material.dispose();
        }

        this.selectionBox = null;
    }

    setSelection(p1: [number, number, number], p2: [number, number, number]) {
        const bounds = {
            minX: Math.min(p1[0], p2[0]),
            maxX: Math.max(p1[0], p2[0]),

            minY: Math.min(p1[1], p2[1]),
            maxY: Math.max(p1[1], p2[1]),

            minZ: Math.min(p1[2], p2[2]),
            maxZ: Math.max(p1[2], p2[2]),
        };

        this.updateSelectionBoxFromBounds(bounds);
    }

    private updateSelectionBoxFromBounds(bounds: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
        minZ: number;
        maxZ: number;
    }) {
        if (!this.scene) return;

        const min = new THREE.Vector3(
            bounds.minX - 0.5,
            bounds.minY - 0.5,
            bounds.minZ - 0.5,
        );

        const max = new THREE.Vector3(
            bounds.maxX + 0.5,
            bounds.maxY + 0.5,
            bounds.maxZ + 0.5,
        );

        const size = new THREE.Vector3().subVectors(max, min);

        const center = new THREE.Vector3()
            .addVectors(min, max)
            .multiplyScalar(0.5);

        if (!this.selectionBox) {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const edges = new THREE.EdgesGeometry(geometry);

            const material = new THREE.LineBasicMaterial({
                color: "#ff9800",
            });

            this.selectionBox = new THREE.LineSegments(edges, material);
            this.selectionBox.name = "selection-region-box";

            this.scene.add(this.selectionBox);
        }

        this.selectionBox.position.copy(center);
        this.selectionBox.scale.copy(size);

        const selectedBlocks = this.getBlocksInsideBounds(bounds);
        this.events.emit('update_selection_box', this.selectionBox, selectedBlocks)
    }

    clearSelection() {
        this.disposeSelectionBox();

        this.events.emit('update_selection_box', this.selectionBox, [])

        this.selectionStart = null;
        this.selectionEnd = null;
        this.isSelectingRegion = false;
    }

    private getSelectionBounds(
        start: THREE.Intersection<THREE.Object3D>,
        end: THREE.Intersection<THREE.Object3D>,
    ) {
        const startPosition = this.getHitBlockPosition(start);
        const endPosition = this.getHitBlockPosition(end);

        if (!startPosition || !endPosition) {
            return null;
        }

        const bounds = {
            minX: Math.min(startPosition.x, endPosition.x),
            maxX: Math.max(startPosition.x, endPosition.x),

            minY: Math.min(startPosition.y, endPosition.y),
            maxY: Math.max(startPosition.y, endPosition.y),

            minZ: Math.min(startPosition.z, endPosition.z),
            maxZ: Math.max(startPosition.z, endPosition.z),
        };

        const min = new THREE.Vector3(
            bounds.minX - 0.5,
            bounds.minY - 0.5,
            bounds.minZ - 0.5,
        );

        const max = new THREE.Vector3(
            bounds.maxX + 0.5,
            bounds.maxY + 0.5,
            bounds.maxZ + 0.5,
        );

        const size = new THREE.Vector3().subVectors(max, min);

        const center = new THREE.Vector3()
            .addVectors(min, max)
            .multiplyScalar(0.5);

        return {
            bounds,
            min,
            max,
            size,
            center,
        };
    }

    private getVisibleBlocks(blocks: Block[]) {
        const key = (x: number, y: number, z: number) => `${x}:${y}:${z}`;

        const solidBlocks = new Map<string, Block>();

        for (const block of blocks) {
            solidBlocks.set(key(block.x, block.y, block.z), block);
        }

        return blocks.filter(block => {
            const neighbors = [
                [1, 0, 0],
                [-1, 0, 0],
                [0, 1, 0],
                [0, -1, 0],
                [0, 0, 1],
                [0, 0, -1],
            ];

            return neighbors.some(([dx, dy, dz]) => {
                return !solidBlocks.has(key(block.x + dx, block.y + dy, block.z + dz));
            });
        });
    }

    private createStairsGeometry() {
        const bottom = new THREE.BoxGeometry(1, 0.5, 1);
        bottom.translate(0, -0.25, 0);

        const step = new THREE.BoxGeometry(1, 0.5, 0.5);
        step.translate(0, 0.25, 0.25);

        return mergeGeometries([bottom, step]);
    }

    private getStairsRotationY(facing?: string) {
        switch (facing) {
            case "south":
                return 0;
            case "west":
                return -Math.PI / 2;
            case "north":
                return Math.PI;
            case "east":
                return Math.PI / 2;
            default:
                return 0;
        }
    }

    async setBlocks(blocks: Block[]) {
        this.blocks = blocks;
        this.blocksGroup.clear();

        const dummy = new THREE.Object3D();

        const blocksByName = Object.groupBy(blocks, block => block.name);
        console.log(blocksByName);

        for (const [name, typedBlocks] of Object.entries(blocksByName)) {
            if (!typedBlocks?.length) continue;

            const material = await this.getMaterial(name);

            let height = 1;
            let diff = 0;

            if (name.includes("slab")) {
                height = 0.5;
                diff = 0.5;
            }

            if (name.includes("pad")) {
                height = 0.1;
                diff = 0.7;
            }

            const isStairs = name.includes("_stairs");

            let geometry: THREE.BufferGeometry;

            if (isStairs) {
                geometry = this.createStairsGeometry();
            } else if (name === "minecraft:soul_lantern") {
                geometry = new THREE.BoxGeometry(0.6, 0.8, 0.6);
            } else {
                geometry = new THREE.BoxGeometry(1, height, 1);
            }

            const mesh = new THREE.InstancedMesh(
                geometry,
                material,
                typedBlocks.length,
            );

            typedBlocks.forEach((block, index) => {
                dummy.position.set(block.x, block.y - diff, block.z);
                dummy.rotation.set(0, 0, 0);

                if (isStairs) {
                    dummy.rotation.y = this.getStairsRotationY(block.state?.facing);

                    if (block.state?.half === "top") {
                        dummy.rotation.x = Math.PI;
                    }
                }

                dummy.updateMatrix();
                mesh.setMatrixAt(index, dummy.matrix);
                (mesh as unknown as InstansedClientMesh).cid = block.id
            });

            mesh.instanceMatrix.needsUpdate = true;
            mesh.name = name;


            this.blocksGroup.add(mesh);
        }

        this.focusCameraOnBlocks(blocks);
    }

    private focusCameraOnBlocks(blocks: Block[]) {
        if (!blocks.length || !this.camera) return;
        if (!(this.camera instanceof THREE.PerspectiveCamera)) {
            return;
        }

        const box = new THREE.Box3();

        for (const block of blocks) {
            box.expandByPoint(new THREE.Vector3(block.x, block.y, block.z));
        }

        const center = new THREE.Vector3();
        const size = new THREE.Vector3();

        box.getCenter(center);
        box.getSize(size);

        const maxSize = Math.max(size.x, size.y, size.z);
        const fov = THREE.MathUtils.degToRad(this.camera.fov);

        const distance = maxSize / (2 * Math.tan(fov / 2));

        this.camera.position.set(
            center.x,
            center.y,
            center.z + distance * 1.4,
        );

        this.camera.lookAt(center);

        this.camera.near = distance / 100;
        this.camera.far = distance * 100;
        this.camera.updateProjectionMatrix();

    }

    private getMaterial = async (name: string) => {
        const textureName = this.material.getPath(name.replace('minecraft:', ''))

        if (!textureName) {
            const fallback = new THREE.MeshStandardMaterial({
                color: "#4B0082",
            });

            this.material.materialCache.set(name, fallback);
            return fallback;
        }

        if (Array.isArray(textureName)) {
            const loadTexture = (path: string) => {
                const texture = this.material.loadMaterial(`/block/${path}`);

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

        const texture = this.material.loadMaterial(`/block/${textureName}`);

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1,
        });

        this.material.materialCache.set(name, material);

        return material;
    };

    private resetHoveredInstance() {
        if (!this.hoveredInstance) return;

        const { mesh, instanceId, originalMatrix } = this.hoveredInstance;

        mesh.setMatrixAt(instanceId, originalMatrix);
        mesh.instanceMatrix.needsUpdate = true;

        this.hoveredInstance = null;
    }

    private removeInstance(hit: THREE.Intersection<THREE.Object3D>) {
        if (
            !(hit.object instanceof THREE.InstancedMesh) ||
            hit.instanceId === undefined
        ) {
            return;
        }

        const mesh = hit.object;
        const instanceId = hit.instanceId;

        const matrix = new THREE.Matrix4();
        matrix.makeScale(0, 0, 0);

        this.hoveredBlock = null;

        mesh.setMatrixAt(instanceId, matrix);
        mesh.instanceMatrix.needsUpdate = true;
        console.error('TODO: fix removing block')
    }

    private onClick = async (event: MouseEvent) => {
        const hit = this.getIntersectionHit(event);
        if (this.mode === 'remove_block' && hit?.object) {
            this.removeInstance(hit);
            return
        }
        if (this.mode === 'add_block' && hit?.object) {
            await this.addBlockNearHit(hit, this.selectedBlockName);
            return;
        }
    }

    private onMouseDown = (event: MouseEvent) => {
        if (this.mode !== "select_region") return;
        if (event.button !== 0) return;

        const hit = this.getIntersectionHit(event);
        if (!hit) return;

        this.selectionStart = hit;
        this.selectionEnd = hit;
        this.isSelectingRegion = true;
    };

    private onMouseMove = (event: MouseEvent) => {
        if (!this.renderer || !this.camera) return;

        const hit = this.getIntersectionHit(event);

        // =========================
        // REGION SELECTION
        // =========================

        if (this.mode === "select_region") {
            if (this.isSelectingRegion && hit && this.selectionStart) {
                this.selectionEnd = hit;

                this.updateSelectionBox(
                    this.selectionStart,
                    this.selectionEnd,
                );
            }

            return;
        }

        // =========================
        // HOVER BLOCK HIGHLIGHT
        // =========================

        if (
            !hit ||
            !(hit.object instanceof THREE.InstancedMesh) ||
            hit.instanceId === undefined
        ) {
            this.resetHoveredInstance();
            this.hoveredBlock = null;
            return;
        }

        const mesh = hit.object;
        const instanceId = hit.instanceId;

        if (
            this.hoveredInstance?.mesh === mesh &&
            this.hoveredInstance?.instanceId === instanceId
        ) {
            return;
        }

        this.resetHoveredInstance();

        const matrix = new THREE.Matrix4();
        mesh.getMatrixAt(instanceId, matrix);

        this.hoveredInstance = {
            mesh,
            instanceId,
            originalMatrix: matrix.clone(),
        };

        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        matrix.decompose(position, quaternion, scale);

        scale.multiplyScalar(1.2);

        const highlightedMatrix = new THREE.Matrix4();

        highlightedMatrix.compose(
            position,
            quaternion,
            scale,
        );

        mesh.setMatrixAt(instanceId, highlightedMatrix);
        mesh.instanceMatrix.needsUpdate = true;

        this.hoveredBlock = hit;
        if (hit.face) {
            this.hoveredFaceNormal = hit.face.normal
                .clone()
                .transformDirection(hit.object.matrixWorld)
                .round();
        }
    };

    private getHoveredBlockPosition() {
        if (!this.hoveredBlock) {
            return null;
        }

        return this.getHitBlockPosition(this.hoveredBlock);
    }

    private onMouseUp = (event: MouseEvent) => {
        if (this.mode !== "select_region") return;
        if (!this.isSelectingRegion) return;

        const hit = this.getIntersectionHit(event);

        if (hit) {
            this.selectionEnd = hit;
        }

        this.isSelectingRegion = false;

        if (!this.selectionStart || !this.selectionEnd) return;

        this.updateSelectionBox(this.selectionStart, this.selectionEnd);

        // дальше можно создать регион
        // this.createRegionFromSelection(this.selectionStart, this.selectionEnd);
    };

    private getHitBlockPosition(
        hit: THREE.Intersection<THREE.Object3D>,
    ): THREE.Vector3 | null {
        if (
            !(hit.object instanceof THREE.InstancedMesh) ||
            hit.instanceId === undefined
        ) {
            return null;
        }

        const matrix = new THREE.Matrix4();
        hit.object.getMatrixAt(hit.instanceId, matrix);

        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        matrix.decompose(position, quaternion, scale);

        return position;
    }

    private getBlocksInsideBounds(bounds: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
        minZ: number;
        maxZ: number;
    }) {
        return this.blocks.filter(block => {
            return (
                block.x >= bounds.minX &&
                block.x <= bounds.maxX &&
                block.y >= bounds.minY &&
                block.y <= bounds.maxY &&
                block.z >= bounds.minZ &&
                block.z <= bounds.maxZ
            );
        });
    }

    private updateSelectionBox(
        start: THREE.Intersection<THREE.Object3D>,
        end: THREE.Intersection<THREE.Object3D>,
    ) {
        const selection = this.getSelectionBounds(start, end);

        if (!selection) return;

        this.updateSelectionBoxFromBounds(selection.bounds);
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

        if (this.mode !== 'select_region') {
            this.moveCamera();
        }

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

    private async addBlockNearHit(
        hit: THREE.Intersection<THREE.Object3D>,
        blockName: string,
    ) {
        const position = this.getHitBlockPosition(hit);

        if (!position || !hit.face) return;

        const normal = hit.face.normal
            .clone()
            .transformDirection(hit.object.matrixWorld)
            .round();

        const block: Block = {
            id: crypto.randomUUID(),
            name: blockName,
            x: position.x + normal.x,
            y: position.y + normal.y,
            z: position.z + normal.z,
            type: "block"
        };

        this.blocks.push(block);

        await this.rebuildMeshesByNames(new Set([block.name]));
    }
}

export default World;