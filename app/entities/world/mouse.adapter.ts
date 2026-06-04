import World from ".";
import { InputState } from "./input.state";

export class MouseAdapter {
    private rotating = false;

    constructor(
        private element: HTMLElement,
        private input: InputState,
        private world: World
    ) {
        element.addEventListener("mousemove", this.onMove);
        element.addEventListener("mousedown", this.onDown);
        element.addEventListener("mouseup", this.onUp);
        element.addEventListener("mouseleave", this.onUp);
    }

    onMove = (e: MouseEvent) => {
        this.input.pointer.x = e.clientX;
        this.input.pointer.y = e.clientY;

        if (!this.rotating || this.world.mode === 'select_region') return;

        this.input.look.x += e.movementX;
        this.input.look.y += e.movementY;
    };

    onDown = (e: MouseEvent) => {
        if (e.button !== 0) return;

        this.rotating = true;
        this.input.pointer.pressed = true;
    };

    onUp = () => {
        this.rotating = false;
        this.input.pointer.pressed = false;
    };

    destroy() {
        this.element.removeEventListener("mousemove", this.onMove);
        this.element.removeEventListener("mousedown", this.onDown);
        this.element.removeEventListener("mouseup", this.onUp);
        this.element.removeEventListener("mouseleave", this.onUp);
    }
}