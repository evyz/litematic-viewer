import * as THREE from 'three';
import { Entity } from "./entity";
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export class Lantern extends Entity {


    private lanternHeight = 0.4375
    private lanternSideWidth = 0.3125

    createGeometry() {
        this.geometry = new THREE.BoxGeometry(this.lanternSideWidth, this.lanternHeight, this.lanternSideWidth);
        return this.geometry;
    }

    applyTransform(object: THREE.Object3D) {
        object.position.set(this.data.x, this.data.y, this.data.z);
        object.rotation.set(0, 0, 0);
        object.scale.set(1, 1, 1);

        if (this.data.state?.hanging) {
            const chain = this.createChainMesh();

            object.add(chain);
        }
    }

    private createChainMesh() {

        const name = this.prepareChainName();
        const texture = this.textureLoader.load(`/block/${name}.png`);

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

        const width = this.lanternSideWidth / 2;
        const height = this.lanternHeight;

        const geo1 = new THREE.PlaneGeometry(width, height);
        const geo2 = new THREE.PlaneGeometry(width, height);

        geo1.rotateY(Math.PI / 4);
        geo2.rotateY(-Math.PI / 4);

        geo1.translate(0, height, 0);
        geo2.translate(0, height, 0);

        const geometry = mergeGeometries([geo1, geo2]);

        return new THREE.Mesh(geometry, material);
    }

    private prepareName(): string | string[] {
        const name = this.name.replace('minecraft:', '')

        if (name === 'lantern') {
            const side = name + '_main'
            const top = side + "_top"
            return [side, side, top, top, side, side]
        }

        return name
    }

    private prepareChainName() {
        return "lantern_main_chain"
    }

    applyMaterial(): THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] {
        const name = this.prepareName()

        if (Array.isArray(name)) {
            const loadTexture = (path: string) => {
                const texture = this.textureLoader.load(`/block/${path}.png`)

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

        const texture = this.textureLoader.load(`/block/${name}.png`);

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1,
        });

        return material
    }
}
