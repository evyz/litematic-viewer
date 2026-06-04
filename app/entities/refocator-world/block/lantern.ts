import * as THREE from 'three';
import { Entity } from "./entity";

export class Lantern extends Entity {
    createGeometry() {
        return new THREE.BoxGeometry(0.3125, 0.4375, 0.3125);
    }

    applyTransform(object: THREE.Object3D) {
        object.position.set(this.data.x, this.data.y, this.data.z);
        object.rotation.set(0, 0, 0);
        object.scale.set(1, 1, 1);

        if (this.data.state?.hanging) {
            const chain = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.5, 0.1),
                new THREE.MeshStandardMaterial({
                    color: "#ffffff",
                })
            );

            chain.position.y = 0.5;

            object.add(chain);
        }
    }


    private prepareName(name: string): string | string[] {
        name = name.replace('minecraft:', '')

        if (name === 'lantern') {
            const side = name + '_main'
            const top = side + "_top"
            return [side, side, top, top, side, side]
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
