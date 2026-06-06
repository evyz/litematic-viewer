import * as THREE from 'three';
import { EntityBlock as Entity } from "./entity";

export class Slab extends Entity {

    private height = 0.5

    createGeometry() {
        const geo = new THREE.BoxGeometry(1, this.height, 1);
        this.geometry = geo;
        return geo
    }

    getPathTexture() {
        return this.prepareName()
    }

    applyTransform(object: THREE.Object3D) {
        const diff = (this.height / 2)
        object.position.set(this.data.x, this.data.y - (this.data?.state?.type === 'top' ? -diff : diff), this.data.z);
        object.rotation.set(0, 0, 0);
        object.scale.set(1, 1, 1);
    }

    private prepareName(): string | string[] {
        let name = this.name.replace('minecraft:', '')
        name = name.replace('_slab', "");

        if (name.includes('_brick')) {
            name += "s"
        }

        return name
    }



    applyMaterial(): THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] {
        const name = this.prepareName()

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
        });

        return material
    }
}
