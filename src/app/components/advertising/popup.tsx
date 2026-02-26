"use client";

import { Advertising } from "@/app/entities/advertising/advertising";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface AdvertisingPopupProps {
    ads: Advertising[];
    onClose: () => void;
}

export default function AdvertisingPopup({ ads, onClose }: AdvertisingPopupProps) {
    const [current, setCurrent] = useState(0);

    if (!ads || ads.length === 0) return null;

    const count = ads.length;
    const ad = ads[current];

    const prev = () => setCurrent((c) => (c - 1 + count) % count);
    const next = () => setCurrent((c) => (c + 1) % count);

    return (
        <div className="flex flex-col w-full bg-[#171d25] overflow-hidden rounded-lg">

            {/* Image area — fixed height, arrows always inside */}
            <div className="relative w-full h-[220px] sm:h-[300px] md:h-[380px] shrink-0 overflow-hidden">
                {ad.cover_image_path ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                        style={{ backgroundImage: `url('${ad.cover_image_path}')` }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                        <span className="text-slate-500 font-medium">Sem imagem</span>
                    </div>
                )}

                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#171d25] via-[#171d25]/30 to-transparent" />

                {/* Promo badge */}
                {ad.type && ad.type !== "standard" && (
                    <div className="absolute top-3 right-3 z-10">
                        <div className="flex items-center justify-center w-10 h-10 md:w-13 md:h-13 bg-orange-600 rounded-full shadow-xl border-2 border-orange-400 rotate-12">
                            <span className="text-[9px] md:text-xs font-bold uppercase text-white leading-none text-center">
                                {ad.type === "promotion" ? "Promo" : "OFF"}
                            </span>
                        </div>
                    </div>
                )}

                {/* Text overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="bg-blue-600 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white">
                            {ad.type || "Anúncio"}
                        </span>
                        {ad.sponsor?.name && (
                            <span className="bg-white/15 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-200">
                                {ad.sponsor.name}
                            </span>
                        )}
                    </div>
                    <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight uppercase line-clamp-2">
                        {ad.title}
                    </h1>
                    <p className="hidden sm:block text-slate-300 text-sm md:text-base leading-relaxed mt-1 line-clamp-2">
                        {ad.description}
                    </p>
                </div>

                {/* Slide dots */}
                {count > 1 && (
                    <div className="absolute top-3 left-3 flex gap-1.5 items-center z-20">
                        {Array.from({ length: count }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                                    i === current ? "w-5 bg-blue-500" : "w-1.5 bg-white/40 hover:bg-white/70"
                                )}
                            />
                        ))}
                    </div>
                )}

                {/* Navigation arrows — always inside image, never clipped */}
                {count > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-12 md:h-12 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                        >
                            <ChevronLeft className="size-5 md:size-7 stroke-[3px]" />
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-12 md:h-12 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                        >
                            <ChevronRight className="size-5 md:size-7 stroke-[3px]" />
                        </button>
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 md:px-6 py-4 bg-[#171d25] border-t border-slate-800/60 shrink-0">
                {/* Metadata */}
                <div className="flex flex-col gap-2">
                    {/* Description shown only on mobile */}
                    <p className="sm:hidden text-slate-300 text-[13px] leading-relaxed line-clamp-2">
                        {ad.description}
                    </p>
                    <div className="flex flex-row items-center gap-4">
                        {ad.contact && (
                            <div className="flex flex-col">
                                <span className="text-[9px] text-orange-500 uppercase font-bold tracking-widest mb-0.5">Contato</span>
                                <span className="text-[13px] md:text-sm font-medium text-slate-300">{ad.contact}</span>
                            </div>
                        )}
                        {ad.contact && ad.sponsor?.name && (
                            <div className="h-6 w-px bg-slate-700 shrink-0" />
                        )}
                        {ad.sponsor?.name && (
                            <div className="flex flex-col">
                                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">Patrocinador</span>
                                <span className="text-[13px] md:text-sm font-medium text-slate-300">{ad.sponsor.name}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto shrink-0">
                    {ad.link && (
                        <a href={ad.link} target="_blank" rel="noopener noreferrer" className="sm:order-last">
                            <Button className="w-full sm:w-auto h-11 sm:h-10 px-6 rounded-sm bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm uppercase tracking-wide border-none shadow-lg">
                                Ver Produto
                            </Button>
                        </a>
                    )}
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="w-full sm:w-auto h-11 sm:h-10 px-6 rounded-sm bg-[#3d4450] hover:bg-[#4a5362] text-white font-medium text-sm border-none"
                    >
                        Fechar
                    </Button>
                </div>
            </div>
        </div>
    );
}
