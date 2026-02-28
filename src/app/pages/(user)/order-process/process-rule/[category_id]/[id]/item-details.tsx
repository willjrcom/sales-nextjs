import Item from '../../../../../../entities/order/item';
import React from 'react';
import Product from '../../../../../../entities/product/product';
import { useModal } from '../../../../../../context/modal/context';
import Image from 'next/image';
import { Card, CardContent } from "../../../../../../../components/ui/card";
import { Badge } from "../../../../../../../components/ui/badge";
import GetProductByID from "@/app/api/product/[id]/product";
import {
    ImageIcon,
    Info,
    MessageSquare,
    PlusCircle,
    MinusCircle,
    Tag
} from "lucide-react";
import { cn } from "../../../../../../../lib/utils";
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

interface ItemDetailsProps {
    item: Item;
    isComplement?: boolean;
}

const ItemDetails = ({ item, isComplement }: ItemDetailsProps) => {
    const modalHandler = useModal();
    const { data } = useSession();

    const { data: product } = useQuery<Product>({
        queryKey: ['product', item.product_id],
        queryFn: () => GetProductByID(item.product_id, data!),
        enabled: !!data?.user?.access_token,
    });

    const openImage = () => {
        if (!product?.image_path) return;
        modalHandler.showModal(
            `product-image-${item.id}`,
            product.name,
            <div className="flex items-center justify-center p-4">
                <Image
                    src={product.image_path}
                    alt={product.name}
                    className="max-w-full max-h-[80vh] w-auto h-auto rounded-lg shadow-2xl"
                    width={800}
                    height={800}
                />
            </div>,
            'xl',
            () => modalHandler.hideModal(`product-image-${item.id}`)
        );
    };

    return (
        <Card className={cn(
            "overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300",
            isComplement && "ring-1 ring-indigo-400 ring-offset-1 shadow-indigo-50"
        )}>
            <CardContent className="p-0">
                <div className={cn("flex flex-col sm:flex-row bg-white", isComplement && "bg-indigo-50/5")}>
                    {/* Left: Product Thumbnail */}
                    <div
                        className={cn(
                            "relative w-full sm:w-24 h-24 sm:h-auto flex-shrink-0 cursor-pointer group overflow-hidden",
                            isComplement ? "bg-indigo-100/30" : "bg-gray-50"
                        )}
                        onClick={openImage}
                    >
                        {product?.image_path ? (
                            <Image
                                src={product.image_path}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                width={120}
                                height={120}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                <ImageIcon size={24} strokeWidth={1.5} />
                                <span className="text-[8px] uppercase mt-1 font-semibold tracking-wider italic">Sem imagem</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm shadow-sm scale-75">Ver</Badge>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="flex-1 p-3 space-y-2">
                        {/* Header */}
                        <div className="flex flex-wrap justify-between items-start gap-2 border-b border-gray-50 pb-1.5">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base font-bold text-gray-800 leading-tight">
                                        {item.quantity}x {item.name}
                                    </h3>
                                    {isComplement && (
                                        <Badge className="bg-indigo-600 text-[9px] py-0 px-1.5 uppercase tracking-wider font-extrabold shadow-sm h-4">
                                            Complemento
                                        </Badge>
                                    )}
                                </div>
                                {product?.description && (
                                    <p className="text-gray-400 text-[10px] line-clamp-1 max-w-sm italic">
                                        {product.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {/* Tags section */}
                            <div className="space-y-2">
                                {item.flavor && (
                                    <div className="flex items-center gap-1.5">
                                        <Tag size={12} className="text-orange-400" />
                                        <div className="bg-orange-50/50 border border-orange-100/50 rounded-md px-2 py-0.5 flex-1">
                                            <p className="text-orange-800 text-[11px] font-bold leading-tight">{item.flavor}</p>
                                        </div>
                                    </div>
                                )}

                                {(item.additional_items?.length || 0) > 0 && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-emerald-600">
                                            <PlusCircle size={10} />
                                            <span className="text-[9px] font-bold uppercase tracking-widest">Adicionais</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {item.additional_items?.map((add) => (
                                                <Badge key={add.id} className="bg-emerald-500/90 hover:bg-emerald-600 text-white border-none text-[10px] font-medium py-0 px-1.5 shadow-sm">
                                                    {add.quantity}x {add.name}{add.flavor ? ` (${add.flavor})` : ''}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(item.removed_items?.length || 0) > 0 && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-rose-400">
                                            <MinusCircle size={10} />
                                            <span className="text-[9px] font-bold uppercase tracking-widest">Removidos</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {item.removed_items?.map((rem, idx: number) => (
                                                <Badge key={idx} variant="destructive" className="bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-100/50 text-[10px] font-medium py-0 px-1.5 shadow-none">
                                                    {rem}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Observation section */}
                            {item.observation && (
                                <div className="bg-red-100 border border-red-100 rounded-lg p-2 self-start shadow-sm">
                                    <div className="flex items-center gap-1.5 text-red-500 mb-0.5">
                                        <MessageSquare size={12} />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Obs</span>

                                        <p className="text-red-900 text-[11px] leading-tight font-medium italic">
                                            "{item.observation}"
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!item.observation && product?.description && (
                                <div className="bg-blue-100 border border-blue-100/50 rounded-lg p-2 self-start">
                                    <div className="flex items-center gap-1.5 text-blue-400 mb-0.5">
                                        <Info size={12} />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Dica</span>
                                    </div>
                                    <p className="text-blue-900/70 text-[10px] leading-tight font-medium line-clamp-2 italic">
                                        {product.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ItemDetails;
