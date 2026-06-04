import * as THREE from 'three';
import { BlockMeta } from "@/app/shared/types/block";

export abstract class Entity {

    mesh?: THREE.Mesh;

    constructor(public data: BlockMeta) {

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

    abstract applyMaterial(texture: THREE.TextureLoader): THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[]

    isSolid() {
        return true;
    }
}