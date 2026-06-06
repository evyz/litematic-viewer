import * as THREE from 'three';
import { EntityBlock as Entity } from "./entity";

export class Wall extends Entity {

    private textures: Record<string, string> = {
        'stone_brick_wall': 'stone_bricks',
        'cobblestone_wall': 'cobblestone'
    }

    private height = 1

    createGeometry() {
        const geo = new THREE.BoxGeometry(0.5, this.height, 0.5);
        this.geometry = geo;
        return geo
    }

    getPathTexture() {
        return this.prepareName()
    }

    applyTransform(object: THREE.Object3D) {
        object.position.set(this.data.x, this.data.y, this.data.z);
        object.rotation.set(0, 0, 0);
        object.scale.set(1, 1, 1);
    }

    private prepareName(): string | string[] {
        const name = this.name.replace('minecraft:', '')
        return this.textures[name];
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
