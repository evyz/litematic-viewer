import World from "@/app/entities/world";
import { State } from "../types"

type Props = {
    state: State;
    world: World;
    open: boolean;
}


export default function Modal({ state: [selectionCoords], world, open }: Props) {
    if (!open) { return }
    return (
        <div className="w-100 h-40 bg-white fixed z-100 top-2 right-2 flex flex-row items-start gap-2 rounded-4xl px-2 py-4">
            <div className="w-1/2 flex flex-col items-start gap-2">
                <span>Position 1:</span>
                <input readOnly value={selectionCoords?.p1[0] ?? ''} onChange={(e) => world.setSelection([Number(e.target.value), selectionCoords?.p1[1] ?? 0, selectionCoords?.p1[2] ?? 0], [selectionCoords?.p2[0] ?? 0, selectionCoords?.p2[1] ?? 0, selectionCoords?.p2[2] ?? 0])} type="number" />
                <input readOnly value={selectionCoords?.p1[1] ?? ''} onChange={(e) => world.setSelection([selectionCoords?.p1[0] ?? 0, Number(e.target.value), selectionCoords?.p1[2] ?? 0], [selectionCoords?.p2[0] ?? 0, selectionCoords?.p2[1] ?? 0, selectionCoords?.p2[2] ?? 0])} type="number" />
                <input readOnly value={selectionCoords?.p1[2] ?? ''} onChange={(e) => world.setSelection([selectionCoords?.p1[0] ?? 0, selectionCoords?.p1[1] ?? 0, Number(e.target.value)], [selectionCoords?.p2[0] ?? 0, selectionCoords?.p2[1] ?? 0, selectionCoords?.p2[2] ?? 0])} type="number" />
            </div>
            <div className="w-1/2 flex flex-col items-start gap-2">
                <span>Position 2:</span>
                <input readOnly value={selectionCoords?.p1[0] ?? ''} onChange={(e) => world.setSelection([selectionCoords?.p1[0] ?? 0, selectionCoords?.p1[1] ?? 0, selectionCoords?.p1[2] ?? 0], [Number(e.target.value), selectionCoords?.p2[1] ?? 0, selectionCoords?.p2[2] ?? 0])} type="number" />
                <input readOnly value={selectionCoords?.p1[1] ?? ''} onChange={(e) => world.setSelection([selectionCoords?.p1[0] ?? 0, selectionCoords?.p1[1] ?? 0, selectionCoords?.p1[2] ?? 0], [selectionCoords?.p2[0] ?? 0, Number(e.target.value), selectionCoords?.p2[2] ?? 0])} type="number" />
                <input readOnly value={selectionCoords?.p1[2] ?? ''} onChange={(e) => world.setSelection([selectionCoords?.p1[0] ?? 0, selectionCoords?.p1[1] ?? 0, selectionCoords?.p1[2] ?? 0], [selectionCoords?.p2[0] ?? 0, selectionCoords?.p2[1] ?? 0, Number(e.target.value)])} type="number" />
            </div>
        </div>
    )
}