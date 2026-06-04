import * as THREE from 'three';
import { Entity } from "./entity";
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export class Stairs extends Entity {
    createGeometry() {
        const bottom = new THREE.BoxGeometry(1, 0.5, 1);
        bottom.translate(0, -0.25, 0);

        const step = new THREE.BoxGeometry(1, 0.5, 0.5);
        step.translate(0, 0.25, 0.25);

        return mergeGeometries([bottom, step]);
    }

    private getStairsRotationY() {
        switch (this.data.state?.facing) {
            case "south":
                return 0;
            case "west":
                return -Math.PI / 2;
            case "north":
                return Math.PI;
            case "east":
                return Math.PI / 2;
            default:
                return 0;
        }
    }

    applyTransform(object: THREE.Object3D) {
        object.position.set(this.data.x, this.data.y, this.data.z);
        object.rotation.set(0, 0, 0);
        object.scale.set(1, 1, 1);

        object.rotation.y = this.getStairsRotationY();

        if (this.data?.state?.half === "top") {
            object.rotation.x = Math.PI;
        }
    }

    private prepareTexture(name: string) {

        name = name.replace('minecraft:', '')
        name = name.replace('_wood', "_log");
        name = name.replace('_stairs', "");

        const wordWithoutS = new Set(['brick', 'stone_brick', 'mossy_stone_brick'])
        const planks = new Set(['spruce'])

        if (wordWithoutS.has(name)) {
            return name + 's'
        }

        if (planks.has(name)) {
            return name + '_planks'
        }

        return name
    }

    applyMaterial(textureLoader: THREE.TextureLoader): THREE.MeshStandardMaterial {
        const name = this.prepareTexture(this.name);

        const texture = textureLoader.load(`/block/${name}.png`, () => { }, () => { }, () => {
            console.log(name);
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
