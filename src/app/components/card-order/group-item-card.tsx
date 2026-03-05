import Decimal from "decimal.js";
import StatusComponent from "../button/show-status";
import ItemCard from "./item-card";
import GroupItem from "@/app/entities/order/group-item";
import Item from "@/app/entities/order/item";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Printer, Package, Clock, ShoppingBag, Info, Activity } from "lucide-react";
import printGroupItem from "../print/print-group-item";
import { Session } from "next-auth";
import { ToUtcDatetime } from "@/app/utils/date";
import { formatCurrency } from "@/app/utils/format";
import { Badge } from "@/components/ui/badge";
import { useModal } from "@/app/context/modal/context";
import OrderProcessTimeline from "./order-process-timeline";

import Refresh from "../crud/refresh";
import { HiOutlineRefresh } from "react-icons/hi";

interface GroupItemCardProps {
    group: GroupItem;
    session: Session;
    onRefresh?: () => void;
    isFetching?: boolean;
}

export default function GroupItemCard({ group, session, onRefresh, isFetching }: GroupItemCardProps) {
    const modalHandler = useModal();
    const total = new Decimal(group.total);
    const subtotal = new Decimal(group.sub_total || 0);
    const hasDiscount = !subtotal.equals(total);

    return (
        <div key={group.id} className="bg-gray-50/50 rounded-[2rem] border border-gray-100 overflow-hidden transition-all hover:border-blue-100">
            <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl border border-gray-100 text-gray-400">
                            <Package className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-wider">
                                    Qtd: {group.quantity}
                                </Badge>
                                <StatusComponent status={group.status} />
                            </div>
                            {group.start_at && (
                                <div className="flex items-center gap-1.5 text-purple-600">
                                    <Clock className="w-3 h-3" />
                                    <p className="text-[10px] font-bold uppercase tracking-wider">Agendado: {ToUtcDatetime(group.start_at)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {group.use_process_rule && (
                            <Button
                                variant="outline" size="icon"
                                className="h-9 w-9 bg-white border-gray-100 text-blue-500 hover:text-blue-600 rounded-xl transition-all active:scale-95 shadow-sm"
                                onClick={() => modalHandler.showModal(
                                    'order-process-' + group.id,
                                    'Histórico do Processo',
                                    <div className="py-4">
                                        <OrderProcessTimeline
                                            groupItemId={group.id}
                                            session={session}
                                            onRefresh={onRefresh}
                                            isFetchingParent={isFetching}
                                        />
                                    </div>,
                                    'md'
                                )}
                            >
                                <Activity className="w-4 h-4" />
                            </Button>
                        )}
                        <Button
                            variant="outline" size="icon"
                            className="h-9 w-9 bg-white border-gray-100 text-gray-400 hover:text-blue-600 rounded-xl transition-all active:scale-95"
                            onClick={() => printGroupItem({ groupItemID: group.id, session })}
                        >
                            <Printer className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {group.observation && (
                    <div className="flex items-start gap-2 p-3 bg-white/80 rounded-2xl border border-dashed border-gray-200">
                        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-bold text-gray-600 uppercase leading-relaxed">{group.observation}</p>
                    </div>
                )}

                {/* Items */}
                <div className="grid grid-cols-1 gap-3">
                    {group.items?.map((item: Item) => <ItemCard key={item.id} item={item} />)}

                    {group.complement_item && (
                        <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-4 border-dashed">
                            <div className="flex items-center gap-2 mb-2 text-blue-600">
                                <ShoppingBag className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Item Complementar</span>
                            </div>
                            <ItemCard item={group.complement_item} />
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-white/50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {hasDiscount && (
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Subtotal Grupo</p>
                            <p className="text-xs font-bold text-gray-500 line-through decoration-gray-300">{formatCurrency(subtotal.toNumber())}</p>
                        </div>
                    )}
                </div>

                <div className="text-right space-y-0.5">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none">Total do Grupo</p>
                    <p className="text-lg font-black text-gray-900 tracking-tight">{formatCurrency(total.toNumber())}</p>
                </div>
            </div>
        </div>
    )
}