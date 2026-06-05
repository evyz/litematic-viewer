import * as THREE from 'three';
import { EntityBlock as Entity } from "./entity";

export class Block extends Entity {

    private grasses: Record<string, [string, string]> = {
        'grass_block': ['grass_block_side', 'grass_block_top'],
        'grass_block_snow': ['grass_block_snow', 'grass_block_top']
    }

    createGeometry() {
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        const hidden = new Set(
            this.hiddenSides.map(side => this.SIDE_INDEX[side])
        );

        this.geometry.groups = this.geometry.groups.filter(group => {
            return !hidden.has(group.materialIndex ?? -1);
        });

        return this.geometry;
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

        if (this.grasses[name]) {
            const [side, top] = this.grasses[name]
            return [side, side, top, top, side, side]
        }


        return name
    }



    applyMaterial(): THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] {

        const name = this.prepareName(this.name)

        if (Array.isArray(name)) {
            const loadTexture = (path: string) => {
                const texture = this.textureLoader.load(`/block/${path}.png`, () => { }, () => { }, (err) => this.events.emit('onFailedLoadTexture', this.name, err))

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

        const texture = this.textureLoader.load(`/block/${name}.png`, () => { }, () => { }, (err) => this.events.emit('onFailedLoadTexture', this.name, err));

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
