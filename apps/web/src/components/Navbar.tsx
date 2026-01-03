import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface NavbarProps {
    isPinMode: boolean;
    onPinModeToggle: () => void;
    radius: number;
    onRadiusChange: (value: number) => void;
}

export function Navbar({ isPinMode, onPinModeToggle, radius, onRadiusChange }: NavbarProps) {
    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border shadow-lg rounded-full px-6 py-3 flex items-center gap-8 min-w-[500px]">
            {/* Pin Mode Toggle */}
            <div className="flex items-center space-x-2">
                <Button
                    variant={isPinMode ? "default" : "secondary"}
                    onClick={onPinModeToggle}
                    className="gap-2"
                >
                    <span className="text-lg">📍</span>
                    {isPinMode ? "Click Map to Pin" : "Set Pin"}
                </Button>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-border" />

            {/* Radius Slider */}
            <div className="flex items-center gap-4 flex-1">
                <Label htmlFor="radius" className="whitespace-nowrap font-medium min-w-[100px]">
                    Radius: {radius / 1000} km
                </Label>
                <Slider
                    id="radius"
                    value={[radius]}
                    max={20000}
                    min={1000}
                    step={500}
                    onValueChange={(vals) => onRadiusChange(vals[0])}
                    className="flex-1"
                />
            </div>
        </div>
    );
}
