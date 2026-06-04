import { Dispatch, SetStateAction } from "react"

export type CoordsState = { p1: [number, number, number], p2: [number, number, number] } | null

export type State = [CoordsState, Dispatch<SetStateAction<CoordsState>>]