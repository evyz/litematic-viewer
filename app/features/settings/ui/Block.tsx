import World from "@/app/entities/refocator-world";
import { ModalProps } from "@/app/shared/types/modal";
import { DialogContent, DialogHeader, DialogTitle, Dialog } from "@/components/ui/dialog";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
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
        const unsub = world.subscribe('onChangeSpeed', (speed) => {
            localStorage.setItem('speed', JSON.stringify(speed));
            setSpeed(speed)
        })

        return () => unsub();
    }, [world]);


    useEffect(() => {
        const token = localStorage.getItem('speed')
        if (!token) { return }
        const speed = Number(token)

        if (Number.isInteger(speed)) {
            world.setSpeed(speed)
        }
    }, [])

    return (
        <Dialog open={modalType === 'settings'} onOpenChange={onClose}>
            <DialogContent className="bg-white">
                <DialogHeader>
                    <DialogTitle className="font-bold">Settings:</DialogTitle>
                </DialogHeader>
                <div className="w-full gap-4 flex flex-row items-center flex-wrap overflow-y-scroll">
                    <Field>
                        <FieldLabel htmlFor="input-speed">Speed camera ({speed})</FieldLabel>
                        <Slider
                            value={[speed]}
                            max={99}
                            min={1}
                            onValueChange={([value]) => updateSpeed(value)}
                            step={1}
                            className="mx-auto w-full max-w-xs"
                        />
                        <FieldDescription>
                            Change your camera speed
                        </FieldDescription>
                    </Field>
                </div>
            </DialogContent>
        </Dialog>
    )
}