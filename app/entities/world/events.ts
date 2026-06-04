import { Block } from '@/app/shared/types/block';
import { Mode } from '@/app/shared/types/mode';
import * as THREE from 'three';

type WorldEventMap = {
    change_speed: (speed: number) => void;
    update_selection_box: (
        selectionBox: THREE.LineSegments<THREE.BufferGeometry<THREE.NormalBufferAttributes, THREE.BufferGeometryEventMap>, THREE.Material<THREE.MaterialEventMap> | THREE.Material<THREE.MaterialEventMap>[], THREE.Object3DEventMap> | null,
        blocks: Block[]
    ) => void;
    change_mode: (mode: Mode) => void;
    change_selected_block: (block: string) => void;
};

type Subscriptions = {
    [K in keyof WorldEventMap]?: Record<string, WorldEventMap[K]>;
};

export type Subscribe = <K extends keyof WorldEventMap>(
    event: K,
    callback: WorldEventMap[K],
    id?: string,
) => () => void;

export class Events {
    private subscriptions: Subscriptions = {};

    subscribe: Subscribe = (event, callback, id) => {
        id = id ?? crypto.randomUUID();
        this.subscriptions[event] ??= {};
        this.subscriptions[event][id] = callback;

        return () => this.unsubscribe(event, id);
    }

    unsubscribe<K extends keyof WorldEventMap>(
        event: K,
        id: string,
    ) {
        delete this.subscriptions[event]?.[id];

        if (
            this.subscriptions[event] &&
            Object.keys(this.subscriptions[event]!).length === 0
        ) {
            delete this.subscriptions[event];
        }
    }

    emit<K extends keyof WorldEventMap>(
        event: K,
        ...args: Parameters<WorldEventMap[K]>
    ) {
        const callbacks = this.subscriptions[event];
        if (callbacks) {
            Object.values(callbacks).forEach((callback) => {
                callback(...args);
            });
        }
    }
}