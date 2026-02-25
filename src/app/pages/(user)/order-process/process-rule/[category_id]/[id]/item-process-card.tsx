import Item from "@/app/entities/order/item";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Tag, PlusCircle, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ItemProcessProps {
    item: Item;
    isComplement?: boolean;
}

const ItemProcessCard = ({ item, isComplement }: ItemProcessProps) => {
    return (
        <li className={cn(
            "flex flex-col bg-white rounded-lg border border-gray-100 p-2.5 shadow-sm transition-all hover:shadow-md",
            isComplement && "border-indigo-500",
            !isComplement && "border-gray-300"
        )}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-800">{item.quantity}x {item.name}</span>
                        {isComplement && (
                            <Badge className="bg-indigo-600 text-[8px] py-0 px-1 uppercase tracking-wider font-extrabold h-3.5">
                                Complemento
                            </Badge>
                        )}
                    </div>

                    {item.flavor && (
                        <div className="flex items-center gap-1.5">
                            <Tag size={10} className="text-orange-400" />
                            <span className="text-[11px] font-bold text-orange-800">{item.flavor}</span>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                        {item.additional_items?.length && item.additional_items.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {item.additional_items.map(add => (
                                    <Badge key={add.id} className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 text-[9px] font-bold py-0 px-1.5 shadow-none h-4">
                                        <PlusCircle size={8} className="mr-0.5" /> {add.quantity}x {add.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                        {item.removed_items?.length && item.removed_items.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {item.removed_items.map((rem, idx) => (
                                    <Badge key={idx} variant="destructive" className="bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-100 text-[9px] font-bold py-0 px-1.5 shadow-none h-4">
                                        <MinusCircle size={8} className="mr-0.5" /> {rem}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {item.observation && (
                        <div className="bg-red-100 border border-red-100 rounded-md p-1.5 mt-1">
                            <div className="flex items-center gap-1 text-red-500 mb-0.5">
                                <MessageSquare size={10} />
                                <span className="text-[8px] font-bold uppercase tracking-widest">Obs</span>
                            </div>
                            <p className="text-red-900 text-[10px] leading-tight font-medium italic">
                                "{item.observation}"
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </li>
    );
};

export default ItemProcessCard;
