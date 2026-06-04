import World from "@/app/entities/world"
import { ModalProps } from "@/app/shared/types/modal";
import { DialogContent, DialogHeader, DialogTitle, Dialog } from "@/components/ui/dialog";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

type Props = ModalProps & {
    world: World;
}

export default function SettingsModal({ world, modalType, onClose }: Props) {

    const [speed, setSpeed] = useState(world.speed);

    const updateSpeed = (value: number) => {
        world.setSpeed(value);
    }

    useEffect(() => {
        const unsub = world.subscribe('change_speed', (speed) => setSpeed(speed))

        return () => unsub();
    }, [world]);

    return (
        <Dialog open={modalType === 'settings'} onOpenChange={onClose}>
            <DialogContent className="bg-white">
                <DialogHeader>
                    <DialogTitle className="font-bold">Settings:</DialogTitle>
                </DialogHeader>
                <div className="w-full gap-4 flex flex-row items-center flex-wrap overflow-y-scroll">
                    <Field>
                        <FieldLabel htmlFor="input-speed">Speed camera</FieldLabel>
                        <Input id="input-speed" type='number' placeholder="10" value={speed} onChange={(e) => updateSpeed(Number(e.target.value) ?? 10)} />
                        <FieldDescription>
                            Change your camera speed
                        </FieldDescription>
                    </Field>
                </div>
            </DialogContent>
        </Dialog>
    )
}