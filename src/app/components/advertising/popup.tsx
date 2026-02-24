import { Advertising } from "@/app/entities/advertising/advertising";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AdvertisingPopupProps {
    ads: Advertising[];
    onClose: () => void;
}

export default function AdvertisingPopup({ ads, onClose }: AdvertisingPopupProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    if (!ads || ads.length === 0) return null;

    return (
        <div className="relative w-full h-full bg-[#171d25] flex flex-col">
            <Carousel setApi={setApi} className="w-full h-full flex flex-col">
                <CarouselContent className="flex-1 h-full ml-0">
                    {ads.map((ad, index) => (
                        <CarouselItem key={ad.id || index} className="h-full pl-0">
                            <div className="relative h-[480px] w-full overflow-hidden">
                                {ad.cover_image_path ? (
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                                        style={{ backgroundImage: `url('${ad.cover_image_path}')` }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                                        <span className="text-slate-500 font-medium">Sem imagem de destaque</span>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-[#171d25] via-[#171d25]/40 to-transparent"></div>

                                {ad.type && ad.type !== 'standard' && (
                                    <div className="absolute top-8 right-8 z-10">
                                        <div className="relative flex items-center justify-center w-20 h-20 bg-orange-600 rounded-full shadow-2xl border-4 border-orange-400 rotate-12 transform hover:scale-110 transition-transform duration-300">
                                            <div className="flex flex-col items-center leading-none text-white font-display">
                                                <span className="text-sm font-bold uppercase tracking-tighter">
                                                    {ad.type === 'promotion' ? 'Promo' : 'OFF'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="absolute bottom-0 left-0 p-10 w-full mb-4">
                                    <div className="flex flex-col gap-3 max-w-2xl">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-blue-600 px-2 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-wider text-white">
                                                {ad.type || 'Anúncio'}
                                            </span>
                                            <span className="bg-white/10 px-2 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                                {ad.sponsor?.name || 'Patrocinado'}
                                            </span>
                                        </div>
                                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight uppercase font-display">
                                            {ad.title}
                                        </h1>
                                        <p className="text-slate-300 text-lg leading-relaxed max-w-xl line-clamp-2">
                                            {ad.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Slide indicators (dots) */}
                                {count > 1 && (
                                    <div className="absolute bottom-10 right-10 flex gap-2.5 items-center z-20">
                                        {Array.from({ length: count }).map((_, i) => (
                                            <div
                                                key={i}
                                                onClick={() => api?.scrollTo(i)}
                                                className={cn(
                                                    "h-2 rounded-full cursor-pointer transition-all duration-300",
                                                    current === i ? "w-8 bg-blue-500" : "w-2 bg-slate-600 hover:bg-slate-500"
                                                )}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between px-10 py-8 bg-[#171d25] border-t border-slate-800/50 mt-auto">
                                <div className="flex items-center gap-8">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-orange-500 uppercase font-bold tracking-widest mb-1">
                                            Contato
                                        </span>
                                        <span className="text-sm font-medium text-slate-300">
                                            {ad.contact || 'Entre em contato'}
                                        </span>
                                    </div>
                                    <div className="h-8 w-[1px] bg-slate-800"></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                                            Patrocinador
                                        </span>
                                        <span className="text-sm font-medium text-slate-300">
                                            {ad.sponsor?.name || 'Moinho Central'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        onClick={onClose}
                                        className="h-10 px-6 rounded-sm bg-[#3d4450]/30 hover:bg-[#3d4450] text-[#dcdedf] font-medium transition-colors text-sm border-none"
                                    >
                                        Fechar
                                    </Button>
                                    {ad.link && (
                                        <a href={ad.link} target="_blank" rel="noopener noreferrer">
                                            <Button className="h-10 px-8 rounded-sm bg-gradient-to-r from-blue-600 to-blue-400 hover:brightness-110 text-white font-medium shadow-lg shadow-blue-500/10 transition-all text-sm flex items-center gap-2 border-none">
                                                Ver Produto
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {count > 1 && (
                    <>
                        <CarouselPrevious className="absolute -left-16 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors bg-transparent border-none hover:bg-transparent h-auto w-auto hidden md:flex">
                            <ChevronLeft className="size-20 stroke-[1px]" />
                        </CarouselPrevious>
                        <CarouselNext className="absolute -right-16 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors bg-transparent border-none hover:bg-transparent h-auto w-auto hidden md:flex">
                            <ChevronRight className="size-20 stroke-[1px]" />
                        </CarouselNext>
                    </>
                )}
            </Carousel>
        </div>
    );
}
