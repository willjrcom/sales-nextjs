
import { cn } from "@/lib/utils";
import React from "react";

interface ThreeColumnHeaderProps {
    left?: React.ReactNode;
    center?: React.ReactNode;
    right?: React.ReactNode;
    subtitle?: React.ReactNode;
    className?: string;
}

export default function ThreeColumnHeader({ left, center, right, subtitle, className }: ThreeColumnHeaderProps) {
    return (
        <div className={cn("flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-4 w-full", className)}>
            <div className={cn("flex justify-center md:justify-start w-full min-w-0 order-2 md:order-1", !left && "hidden md:flex")}>
                {left}
            </div>
            <div className="flex flex-col items-center justify-center w-full min-w-0 order-1 md:order-2">
                <div className="flex justify-center w-full">
                    {center}
                </div>
                {subtitle && (
                    <div className="text-[10px] md:text-xs text-muted-foreground font-medium -mt-1 md:-mt-0.5">
                        {subtitle}
                    </div>
                )}
            </div>
            <div className={cn("flex justify-center md:justify-end w-full min-w-0 order-3", !right && "hidden md:flex")}>
                {right}
            </div>
        </div>
    );
}
