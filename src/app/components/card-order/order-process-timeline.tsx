'use client';

import { useQuery } from "@tanstack/react-query";
import { Session } from "next-auth";
import GetProcessesByGroupItemID from "@/app/api/order-process/by-group-item/order-process";
import OrderProcess from "@/app/entities/order-process/order-process";
import { Loader2, CheckCircle2, Clock, PlayCircle, XCircle, PauseCircle, FastForward } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface OrderProcessTimelineProps {
    groupItemId: string;
    session: Session;
}

const statusConfig = {
    Pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-100", label: "Pendente" },
    Started: { icon: PlayCircle, color: "text-blue-500", bg: "bg-blue-100", label: "Iniciado" },
    Finished: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-100", label: "Concluído" },
    Paused: { icon: PauseCircle, color: "text-gray-500", bg: "bg-gray-100", label: "Pausado" },
    Continued: { icon: FastForward, color: "text-indigo-500", bg: "bg-indigo-100", label: "Retomado" },
    Cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-100", label: "Cancelado" },
};

export default function OrderProcessTimeline({ groupItemId, session }: OrderProcessTimelineProps) {
    const { data: processes, isLoading } = useQuery({
        queryKey: ['order-processes', groupItemId],
        queryFn: () => GetProcessesByGroupItemID(groupItemId, session),
    });

    const sortedProcesses = processes ? [...processes].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ) : [];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Carregando histórico...</p>
            </div>
        );
    }

    if (!processes || processes.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Nenhum registro encontrado</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-100 before:via-gray-200 before:to-gray-100">
            {sortedProcesses.map((process: OrderProcess, idx: number) => {
                const config = statusConfig[process.status as keyof typeof statusConfig] || statusConfig.Pending;
                const Icon = config.icon;

                return (
                    <div key={process.id} className="relative flex items-start gap-6 group">
                        {/* Dot / Icon */}
                        <div className={cn(
                            "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-sm transition-transform group-hover:scale-110",
                            config.bg,
                            config.color
                        )}>
                            <Icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-1 pt-1">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    {process.process_rule?.name ? (
                                        <>
                                            <h4 className="font-black text-gray-900 uppercase text-[11px] tracking-tight leading-tight">
                                                {process.process_rule.name}
                                            </h4>
                                            <div className={cn(
                                                "mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter w-fit",
                                                config.bg,
                                                config.color
                                            )}>
                                                {config.label}
                                            </div>
                                        </>
                                    ) : (
                                        <h4 className="font-black text-gray-800 uppercase text-xs tracking-tight">
                                            {config.label}
                                        </h4>
                                    )}
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tabular-nums">
                                    {format(new Date(process.created_at), "HH:mm:ss", { locale: ptBR })}
                                </span>
                            </div>

                            <div className="bg-white/50 border border-gray-100/80 rounded-2xl p-3 space-y-2 shadow-sm">
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Data</span>
                                    <span className="text-gray-600 font-black tabular-nums">{format(new Date(process.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                                </div>

                                {process.duration_formatted && (
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Duração</span>
                                        <span className="text-blue-600 font-black">{process.duration_formatted}</span>
                                    </div>
                                )}

                                {process.cancelled_reason && (
                                    <div className="mt-2 p-2 bg-red-50 rounded-xl border border-red-100">
                                        <p className="text-[10px] text-red-700 font-bold italic">"{process.cancelled_reason}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
