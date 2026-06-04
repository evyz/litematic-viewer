import { InputState } from "./input.state";

export class KeyboardAdapter {
    constructor(
        private element: Window,
        private input: InputState,
    ) {
        element.addEventListener("keydown", this.onKeyDown);
        element.addEventListener("keyup", this.onKeyUp);
    }

    onKeyDown = (e: KeyboardEvent) => {
        this.input.buttons.add(e.code);

        this.updateMovement();
    };

    onKeyUp = (e: KeyboardEvent) => {
        this.input.buttons.delete(e.code);

        this.updateMovement();
    };

    updateMovement() {
        const buttons = this.input.buttons;

        if (buttons.has("KeyA") && !buttons.has("KeyD")) {
            this.input.move.x = -1;
        } else if (buttons.has("KeyD") && !buttons.has("KeyA")) {
            this.input.move.x = 1;
        } else {
            this.input.move.x = 0;
        }

        if (buttons.has("KeyW") && !buttons.has("KeyS")) {
            this.input.move.z = 1;
        } else if (buttons.has("KeyS") && !buttons.has("KeyW")) {
            this.input.move.z = -1;
        } else {
            this.input.move.z = 0;
        }

        if (buttons.has("Space") && !buttons.has("ShiftLeft")) {
            this.input.move.y = 1;
        } else if (buttons.has("ShiftLeft") && !buttons.has("Space")) {
            this.input.move.y = -1;
        } else {
            this.input.move.y = 0;
        }
    }

    destroy() {
        this.element.removeEventListener("keydown", this.onKeyDown);
        this.element.removeEventListener("keyup", this.onKeyUp);
    }
}