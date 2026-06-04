import * as THREE from 'three';
import { Entity } from "./entity";

export class Block extends Entity {
    createGeometry() {
        return new THREE.BoxGeometry(1, 1, 1);
    }

    applyTransform(object: THREE.Object3D) {
        object.position.set(this.data.x, this.data.y, this.data.z);
        object.rotation.set(0, 0, 0);
        object.scale.set(1, 1, 1);
    }


    private prepareName(name: string): string | string[] {

        name = name.replace('minecraft:', '')
        name = name.replace('_wood', "_log");
        name = name.replace('_stairs', "");

        if (name.includes("_log")) {
            const side = [name, name]
            const topPath = name + '_top'
            const top = [topPath, topPath]
            if (this.data.state?.axis === "x") {
                return [...side, ...side, ...top]
            }
            if (this.data.state?.axis === "z") {
                return [...top, ...side, ...side]
            }
            return [...side, ...top, ...side]
        }

        return name
    }



    applyMaterial(textureLoader: THREE.TextureLoader): THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] {

        const name = this.prepareName(this.name)

        if (Array.isArray(name)) {
            const loadTexture = (path: string) => {
                const texture = textureLoader.load(`/block/${path}.png`)

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

        const texture = textureLoader.load(`/block/${name}.png`);

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
