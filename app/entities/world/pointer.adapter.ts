import { InputState } from "./input.state";

export class PointerLockMouseAdapter {
    private locked = false;

    constructor(
        private element: HTMLElement,
        private input: InputState,
        private onDestroy?: () => void,
    ) {
        element.addEventListener("mousemove", this.onMove);
        document.addEventListener("pointerlockchange", this.onPointerLockChange);

        this.element.requestPointerLock();
    }

    onPointerLockChange = () => {
        this.locked = document.pointerLockElement === this.element;
        this.input.pointer.pressed = this.locked;

        if (this.locked === false) {
            this.onDestroy?.();
        }
    };

    onMove = (e: MouseEvent) => {
        if (!this.locked) return;

        this.input.look.x += e.movementX;
        this.input.look.y += e.movementY;
    };

    destroy() {
        this.element.removeEventListener("mousemove", this.onMove);
        document.removeEventListener("pointerlockchange", this.onPointerLockChange);

        if (document.pointerLockElement === this.element) {
            document.exitPointerLock();
        }
    }
}