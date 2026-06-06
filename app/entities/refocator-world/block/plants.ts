import * as THREE from 'three';
import { EntityBlock as Entity } from "./entity";
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
        return name
    }

    getPathTexture() {
        return this.prepareName()
    }

    applyMaterial(): THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] {
        const name = this.prepareName();


        if (Array.isArray(name)) {
            const loadTexture = (path: string) => {
                const texture = this.textureLoader.load(`/block/${path}.png`, () => { }, () => { }, (err) => {
                    this.events.emit('onFailedLoadTexture', path, err)
                })

                texture.colorSpace = THREE.SRGBColorSpace;
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;
                texture.generateMipmaps = false;

                return texture;
            };

            return name.map(path => {
                return new THREE.MeshStandardMaterial({
                    map: loadTexture(path),
                });
            });
        }

        const texture = this.textureLoader.load(`/block/${name}.png`, () => { }, () => { }, (err) => {
            this.events.emit('onFailedLoadTexture', name, err)
        });


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
