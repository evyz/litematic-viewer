import World from "@/app/entities/world";
import { Dispatch, SetStateAction } from "react";

type Props = {
    setIsLockedCursor: Dispatch<SetStateAction<boolean>>;
    world: World;
}

export default function CursorContainer({ setIsLockedCursor, world }: Props) {
    return (
        <button onClick={() => {
            setIsLockedCursor(true);
            world.setMode('default');
        }} className="h-full size-10 rounded-[50%] flex items-center justify-center bg-slate-500 select-none"><Icon /></button>
    )
}

function Icon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 12H16" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 16V8" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

    )
}