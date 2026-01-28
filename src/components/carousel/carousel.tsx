"use client";

import * as React from "react";
import {
    Carousel as ShadcnCarousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface CarouselProps<T> {
    items: T[];
    children: (item: T) => React.ReactNode;
    className?: string;
}

const Carousel = <T extends { id: string }>({
    items,
    children,
    className,
}: CarouselProps<T>) => {
    return (
        <div className={cn("w-full overflow-hidden box-border px-12", className)}>
            <ShadcnCarousel
                opts={{
                    align: "start",
                    loop: false,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-[10px] min-[900px]:-ml-[20px] min-[1200px]:-ml-[30px] min-[1600px]:-ml-[40px]">
                    {items.map((item) => (
                        <CarouselItem
                            key={item.id}
                            className="pl-[10px] min-[900px]:pl-[20px] min-[1200px]:pl-[30px] min-[1600px]:pl-[40px] basis-full min-[900px]:basis-1/2 min-[1200px]:basis-1/3 min-[1600px]:basis-1/4"
                        >
                            {children(item)}
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="hidden md:block">
                    <CarouselPrevious />
                    <CarouselNext />
                </div>
            </ShadcnCarousel>
        </div>
    );
};

export default Carousel;
