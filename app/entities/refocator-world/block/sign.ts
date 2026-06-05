import * as THREE from 'three';
import { EntityBlock as Entity } from "./entity";

export class Sign extends Entity {
    createGeometry() {
        const geo = new THREE.BoxGeometry(1, 0.3, 0.2);
        this.geometry = geo;
        return geo
    }

    private getRotationY() {
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

        object.rotation.y = this.getRotationY();
    }

    private prepareTexture(name: string) {
        name = name.replace('minecraft:', '')
        return name
    }

    applyMaterial(): THREE.MeshStandardMaterial {
        const name = this.prepareTexture(this.name);
        console.log(name);

        const texture = this.textureLoader.load(`/block/${name}.png`, () => { }, () => { }, (err) => {
            this.events.emit('onFailedLoadTexture', name, err)
            console.warn('asdasdoladloadsasd')
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
