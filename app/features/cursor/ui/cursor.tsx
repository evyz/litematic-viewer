export default function Cursor() {
    return (
        <div className="fixed left-1/2 top-1/2 z-50 h-6 w-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="absolute left-1/2 top-0 h-6 w-[2px] -translate-x-1/2 bg-white shadow-[0_0_2px_black]" />
            <div className="absolute left-0 top-1/2 h-[2px] w-6 -translate-y-1/2 bg-white shadow-[0_0_2px_black]" />
        </div>
    )
}