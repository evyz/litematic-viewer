import * as THREE from 'three';
import { BlockMeta } from "@/app/shared/types/block";
import { Events } from '../events';

export type BoxSide = "right" | "left" | "top" | "bottom" | "front" | "back";

export abstract class EntityBlock {

    mesh?: THREE.Mesh;
    geometry?: THREE.BufferGeometry;
    hiddenSides: BoxSide[] = [];

    constructor(public data: BlockMeta, readonly textureLoader: THREE.TextureLoader, readonly events: Events) {

    }

    get SIDE_INDEX() {
        return {
            right: 0,
            left: 1,
            top: 2,
            bottom: 3,
            front: 4,
            back: 5,
        };
    }

    get id() {
        return this.data.id;
    }

    get name() {
        return this.data.name;
    }

    setMesh(mesh: THREE.Mesh) {
        this.mesh = mesh;
    }

    getRenderKey() {
        return `${this.data.x}-${this.data.y}-${this.data.z}`
    }

    get position() {
        return new THREE.Vector3(this.data.x, this.data.y, this.data.z);
    }

    abstract createGeometry(): THREE.BufferGeometry;

    getMaterialName() {
        return this.name;
    }

    applyTransform(object: THREE.Object3D) {
        object.position.set(this.data.x, this.data.y, this.data.z);
    }

    abstract applyMaterial(): THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[]

    isSolid() {
        return true;
    }


    hideBoxSides(
        sidesToHide: BoxSide[]
    ) {
        this.hiddenSides = sidesToHide;
    }
}