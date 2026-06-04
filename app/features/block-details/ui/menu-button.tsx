import { ModalStateProps } from "@/app/shared/types/modal";

export default function BlockDetailsMenuButton({ setModalType, modalType }: ModalStateProps) {
    return (
        <button onClick={() => setModalType("used_blocks")} className="h-full size-10 rounded-[50%] flex items-center justify-center bg-slate-500 select-none" >
            {modalType === 'used_blocks' ? <ActiveIcon /> : <Icon />}
        </button>
    )
}

const Icon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
            d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
            stroke="#292D32"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M10 2V22"
            stroke="#292D32"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M10 8.5H22"
            stroke="#292D32"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M10 15.5H22"
            stroke="#292D32"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const ActiveIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
            d="M22 7.74995H9.75V1.94995H16.19C19.83 1.94995 22 4.11995 22 7.74995Z"
            fill="#292D32"
        />
        <path
            d="M22 16.25C21.95 19.82 19.79 21.95 16.19 21.95H9.75V16.25H22Z"
            fill="#292D32"
        />
        <path
            d="M8.25 1.94995V21.95H7.81C4.17 21.95 2 19.78 2 16.14V7.75995C2 4.11995 4.17 1.94995 7.81 1.94995H8.25Z"
            fill="#292D32"
        />
        <path
            d="M22 9.25H9.75V14.75H22V9.25Z"
            fill="#292D32"
        />
    </svg>
);