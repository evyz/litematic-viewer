"use client"

type Props = {
    name: string;
    onClick: () => void;
    getPath: (name: string) => void;
}

export default function Block({ name, getPath, onClick }: Props) {
    return (
        <div onClick={onClick} className="w-[50px] h-[60px] wrap-break-word">
            <img src={getPath(name)} />
            <span>{name}</span>
        </div>
    )
}