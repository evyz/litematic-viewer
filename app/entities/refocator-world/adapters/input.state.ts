export class InputState {
    pointer = {
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        pressed: false,
    }

    move = {
        x: 0, // left/right
        y: 0, // up/down
        z: 0, // forward/back
    }

    look = {
        x: 0,
        y: 0,
    }

    buttons = new Set<string>()
}