import World from "@/app/entities/refocator-world";

declare global {
    interface Window {
        world?: World;
    }
}

export { };