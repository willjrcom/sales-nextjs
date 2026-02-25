import Item from '../../../../../../entities/order/item';
import React from 'react';
import Product from '../../../../../../entities/product/product';
import { useModal } from '../../../../../../context/modal/context';
import Image from 'next/image';
import { Card, CardContent } from "../../../../../../../components/ui/card";
import { Badge } from "../../../../../../../components/ui/badge";
import {
    ImageIcon,
    Info,
    MessageSquare,
    PlusCircle,
    MinusCircle,
    Tag
} from "lucide-react";
import { cn } from "../../../../../../../lib/utils";

interface ItemDetailsProps {
    item: Item;
    product?: Product;
    isComplement?: boolean;
}

const ItemDetails = ({ item, product, isComplement }: ItemDetailsProps) => {
    const modalHandler = useModal();

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
            "overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300",
            isComplement && "ring-2 ring-indigo-500 ring-offset-2 shadow-indigo-100"
        )}>
            <CardContent className="p-0">
                <div className={cn("flex flex-col sm:flex-row bg-white", isComplement && "bg-indigo-50/10")}>
                    {/* Left: Product Thumbnail */}
                    <div
                        className={cn(
                            "relative w-full sm:w-32 h-32 sm:h-auto flex-shrink-0 cursor-pointer group overflow-hidden",
                            isComplement ? "bg-indigo-100/50" : "bg-gray-50"
                        )}
                        onClick={openImage}
                    >
                        {product?.image_path ? (
                            <Image
                                src={product.image_path}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                width={200}
                                height={200}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                <ImageIcon size={32} strokeWidth={1.5} />
                                <span className="text-[10px] uppercase mt-2 font-semibold tracking-wider italic">Sem imagem</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm shadow-sm scale-90">Ver foto</Badge>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="flex-1 p-5 space-y-4">
                        {/* Header */}
                        <div className="flex flex-wrap justify-between items-start gap-4 border-b border-gray-100 pb-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                        {item.name}
                                    </h3>
                                    {isComplement && (
                                        <Badge className="bg-indigo-600 text-[10px] py-0 px-2 uppercase tracking-wider font-extrabold shadow-sm">
                                            Complemento
                                        </Badge>
                                    )}
                                </div>
                                {product?.description && (
                                    <p className="text-gray-500 text-sm line-clamp-1 max-w-md italic">
                                        {product.description}
                                    </p>
                                )}
                            </div>
                            <Badge variant="outline" className="text-lg py-1 px-3 border-emerald-100 bg-emerald-50/30 text-emerald-700 font-bold border-2">
                                Qtd: {item.quantity}
                            </Badge>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Tags section */}
                            <div className="space-y-3">
                                {item.flavor && (
                                    <div className="flex items-center gap-2">
                                        <Tag size={16} className="text-orange-500" />
                                        <div className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 flex-1">
                                            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-tighter block">Sabor</span>
                                            <p className="text-orange-900 text-sm font-bold leading-tight">{item.flavor}</p>
                                        </div>
                                    </div>
                                )}

                                {(item.additional_items?.length || 0) > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-emerald-600">
                                            <PlusCircle size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Adicionais</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.additional_items?.map((add) => (
                                                <Badge key={add.id} className="bg-emerald-500 hover:bg-emerald-600 text-white border-none text-[11px] font-medium py-0.5 shadow-sm">
                                                    {add.quantity}x {add.name}{add.flavor ? ` (${add.flavor})` : ''}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(item.removed_items?.length || 0) > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-rose-500">
                                            <MinusCircle size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Removidos</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.removed_items?.map((rem, idx: number) => (
                                                <Badge key={idx} variant="destructive" className="bg-rose-100 text-rose-600 hover:bg-rose-200 border-none text-[11px] font-medium py-0.5 shadow-none">
                                                    {rem}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Observation section */}
                            {item.observation && (
                                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 self-start shadow-inner">
                                    <div className="flex items-center gap-2 text-amber-600 mb-2">
                                        <MessageSquare size={16} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Observação</span>
                                    </div>
                                    <p className="text-amber-900 text-sm leading-relaxed font-medium">
                                        "{item.observation}"
                                    </p>
                                </div>
                            )}

                            {!item.observation && product?.description && (
                                <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-4 self-start shadow-inner">
                                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                                        <Info size={16} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Descrição</span>
                                    </div>
                                    <p className="text-blue-900 text-sm leading-relaxed font-medium line-clamp-3">
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
