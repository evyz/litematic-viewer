import * as THREE from 'three';
import { Entity } from "./entity";
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export class Plants extends Entity {

    private lanternHeight = 1
    private lanternSideWidth = 1

    createGeometry() {
        this.geometry = this.createIntersectionMesh();
        return this.geometry;
    }

    applyTransform(object: THREE.Object3D) {
        object.position.set(this.data.x, this.data.y, this.data.z);
        object.rotation.set(0, 0, 0);
        object.scale.set(1, 1, 1);
    }

    private createIntersectionMesh() {
        const width = this.lanternSideWidth;
        const height = this.lanternHeight;

        const geo1 = new THREE.PlaneGeometry(width, height);
        const geo2 = new THREE.PlaneGeometry(width, height);

        geo1.rotateY(Math.PI / 4);
        geo2.rotateY(-Math.PI / 4);

        geo1.translate(0, height, 0);
        geo2.translate(0, height, 0);

        const geometry = mergeGeometries([geo1, geo2]);

        return geometry
    }

    private prepareName(): string | string[] {
        const name = this.name.replace('minecraft:', '')

        console.log(name);
        return name
    }

    applyMaterial(): THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] {
        const name = this.prepareName();
        const texture = this.textureLoader.load(`/block/${name}.png`);
        console.log(`/block/${name}.png`);

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1,
            side: THREE.DoubleSide,
        });

        return material
    }
}
