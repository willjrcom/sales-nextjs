
import { cn } from "@/lib/utils";
import React from "react";

interface ThreeColumnHeaderProps {
    left?: React.ReactNode;
    center?: React.ReactNode;
    right?: React.ReactNode;
    className?: string;
}

export default function ThreeColumnHeader({ left, center, right, className }: ThreeColumnHeaderProps) {
    return (
        <div className={cn("flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-center gap-4 w-full", className)}>
            <div className={cn("flex justify-center md:justify-start w-full min-w-0 order-2 md:order-1", !left && "hidden md:flex")}>
                {left}
            </div>
            <div className="flex justify-center w-full min-w-0 order-1 md:order-2">
                {center}
            </div>
            <div className={cn("flex justify-center md:justify-end w-full min-w-0 order-3", !right && "hidden md:flex")}>
                {right}
            </div>
        </div>
    );
}
