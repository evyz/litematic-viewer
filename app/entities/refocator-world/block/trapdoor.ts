import * as THREE from 'three';
import { EntityBlock as Entity } from "./entity";

export class TrapDoor extends Entity {
    private readonly thickness = 0.1875;

    createGeometry() {
        this.geometry = new THREE.BoxGeometry(1, this.thickness, 1);
        return this.geometry;
    }

    getPathTexture() {
        return this.prepareName()
    }

    applyTransform(object: THREE.Object3D) {
        const { x, y, z, state } = this.data;

        object.position.set(x, y, z);
        object.rotation.set(0, 0, 0);
        object.scale.set(1, 1, 1);

        const open = state?.open ?? false;
        const half = state?.half ?? "bottom";
        const facing = state?.facing ?? "north";

        const halfOffset = 0.5 - this.thickness / 2;

        if (!open) {
            object.position.y = y + (half === "top" ? halfOffset : -halfOffset);
            return;
        }

        const sideOffset = 0.5 - this.thickness / 2;

        switch (facing) {
            case "north":
                object.rotation.x = Math.PI / 2;
                object.position.z = z + sideOffset;
                break;

            case "south":
                object.rotation.x = Math.PI / 2;
                object.position.z = z - sideOffset;
                break;

            case "west":
                object.rotation.z = Math.PI / 2;
                object.position.x = x + sideOffset;
                break;

            case "east":
                object.rotation.z = Math.PI / 2;
                object.position.x = x - sideOffset;
                break;
        }
    }

    private prepareName(): string | string[] {

        let name = this.name.replace('minecraft:', '')
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
