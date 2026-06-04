import * as THREE from 'three'

export class Material {
    private materialCache = new Map<string, THREE.MeshStandardMaterial>();
    private textureLoader = new THREE.TextureLoader();

    constructor() { }

    getPath(name: string) {
        name = name.replace('minecraft:', '')
        name = name.replace('_wood', "_log");
        name = name.replace('_stairs', "");
        return `/block/${name}.png`;
    }

    loadMaterial(path: string, name: string) {
        const texture = this.textureLoader.load(path);

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1,
        });

        this.materialCache.set(name, material);
        return material
    }
}