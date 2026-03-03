import Item from "@/app/entities/order/item";
import Decimal from "decimal.js";
import { formatCurrency } from "@/app/utils/format";
import { Info, Plus, Minus, LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ItemCardProps {
    item: Item;
}

const DetailBadge = ({ children, Icon, className }: { children: React.ReactNode, Icon: LucideIcon, className: string }) => (
    <Badge variant="outline" className={`px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-tighter gap-1 ${className}`}>
        <Icon className="w-2.5 h-2.5" />
        {children}
    </Badge>
);

export default function ItemCard({ item }: ItemCardProps) {
    const hasExtras = (item.additional_items?.length || 0) > 0 || (item.removed_items?.length || 0) > 0;

    return (
        <div key={item.id} className="group bg-white rounded-2xl border border-gray-100 p-4 transition-all hover:shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <h4 className="font-black text-gray-900 leading-tight">
                        <span className="text-blue-600 mr-2">{item.quantity}x</span>
                        {item.name}
                    </h4>

                    {item.observation && (
                        <div className="flex items-center gap-1.5 text-amber-600">
                            <Info className="w-3.5 h-3.5" />
                            <p className="text-[10px] font-bold uppercase tracking-wider">{item.observation}</p>
                        </div>
                    )}
                </div>

                <div className="text-right shrink-0">
                    <p className="text-sm font-black text-gray-900">{formatCurrency(new Decimal(item.total).toNumber())}</p>
                </div>
            </div>

            {hasExtras && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {item.removed_items?.map((rem: string) => (
                        <DetailBadge key={rem} Icon={Minus} className="bg-red-50 text-red-600 border-red-100">
                            {rem}
                        </DetailBadge>
                    ))}

                    {item.additional_items?.map((add: Item) => (
                        <DetailBadge key={add.id} Icon={Plus} className="bg-emerald-50 text-emerald-600 border-emerald-100">
                            {add.quantity > 1 && `${add.quantity}x `}{add.name}{add.flavor ? ` (${add.flavor})` : ''}
                        </DetailBadge>
                    ))}
                </div>
            )}
        </div>
    )
}