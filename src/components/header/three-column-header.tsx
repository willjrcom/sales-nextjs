
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
        <div className={cn("grid grid-cols-[1fr_auto_1fr] items-center gap-4 w-full", className)}>
            <div className="flex justify-start w-full min-w-0">
                {left}
            </div>
            <div className="flex justify-center w-full min-w-0">
                {center}
            </div>
            <div className="flex justify-end w-full min-w-0">
                {right}
            </div>
        </div>
    );
}
