import { useState } from "react";
import RequestError from "@/app/utils/error";
import NewComplementGroupItem from "@/app/api/group-item/update/complement/group-item";
import GetGroupItemByID from "@/app/api/group-item/[id]/group-item";
import { useModal } from "@/app/context/modal/context";
import GroupItem from "@/app/entities/order/group-item";
import Product from "@/app/entities/product/product";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { FaPlus } from "react-icons/fa";
import Decimal from "decimal.js";
import { notifyError } from "@/app/utils/notifications";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { GetStockByProductID } from "@/app/api/stock/stock";

interface AddComplementItemModalProps {
    product: Product;
}

const AddComplementItemModal = ({ product }: AddComplementItemModalProps) => {
    const { data } = useSession();
    const queryClient = useQueryClient();
    const modalHandler = useModal();
    const groupItem = queryClient.getQueryData<GroupItem | null>(['group-item', 'current']);
    const { data: session } = useSession();

    const { data: stocks } = useQuery({
        queryKey: ['stocks', 'product', product.id],
        queryFn: () => GetStockByProductID(product.id, session!),
        enabled: !!session?.user,
    });

    const [showVariations, setShowVariations] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = async (variationId: string) => {
        if (!data) return
        if (!groupItem) return notifyError("Nenhum grupo de itens selecionado")

        setIsSubmitting(true);
        try {
            await NewComplementGroupItem(groupItem.id, product.id, variationId, data)
            const updatedGroupItem = await GetGroupItemByID(groupItem.id, data);
            queryClient.setQueryData(['group-item', 'current'], updatedGroupItem);
            queryClient.invalidateQueries({ queryKey: ['order', 'current'] });
            modalHandler.hideModal("add-complement-item-group-item-" + groupItem?.id)
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao adicionar complemento");
            queryClient.invalidateQueries({ queryKey: ['stocks', 'product', product.id] });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!showVariations) {
        return (
            <div
                className="group border rounded-xl bg-white overflow-hidden w-full max-w-sm mx-auto transition-all duration-300 hover:shadow-xl hover:border-blue-300 cursor-pointer"
                onClick={() => setShowVariations(true)}
            >
                {/* Header info with image */}
                <div className="relative h-40 bg-gray-50 overflow-hidden">
                    {product.image_path ? (
                        <Image
                            src={product.image_path}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                            <FaPlus size={24} className="text-gray-200" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Complemento</span>
                        <h2 className="text-white font-bold text-base leading-tight line-clamp-2">{product.name}</h2>
                    </div>
                </div>

                <div className="p-3 flex items-center justify-between bg-white group-hover:bg-blue-50 transition-colors">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-tight">Ver tamanhos</span>
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <FaPlus size={10} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="group border rounded-xl bg-white overflow-hidden w-full max-w-sm mx-auto shadow-md border-blue-100">
            {/* Small Header for navigation back */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 border-b relative">
                <button
                    onClick={() => setShowVariations(false)}
                    className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    title="Voltar"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-xs leading-tight text-gray-900 truncate">{product.name}</h2>
                    <p className="text-[10px] text-gray-400 font-medium">Selecione o tamanho</p>
                </div>
                <span className="bg-white text-gray-500 text-[9px] px-1.5 py-0.5 rounded border font-mono">
                    #{product.sku}
                </span>
            </div>

            {/* Variations List */}
            <div className="max-h-64 overflow-y-auto p-1 divide-y divide-gray-50">
                {product.variations?.length > 0 ? (
                    product.variations.map((variation) => (
                        <div key={variation.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors group/item">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
                                    {typeof variation.size === 'string' ? variation.size : variation.size?.name}
                                </span>
                                <span className="text-sm font-extrabold text-blue-600">
                                    R$ {new Decimal(variation.price).toFixed(2)}
                                </span>
                                {(() => {
                                    const stockRecord = stocks?.find(s => s.product_variation_id === variation.id) || stocks?.find(s => !s.product_variation_id);
                                    const available = stockRecord ? new Decimal(stockRecord.current_stock) : null;
                                    if (available !== null) {
                                        return (
                                            <span className={`text-[9px] font-bold ${available.gt(0) ? 'text-gray-400' : 'text-red-500'}`}>
                                                Estoque: {available.toFixed(2)}
                                            </span>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                            <button
                                onClick={() => submit(variation.id)}
                                disabled={isSubmitting || (() => {
                                    const stockRecord = stocks?.find(s => s.product_variation_id === variation.id) || stocks?.find(s => !s.product_variation_id);
                                    const available = stockRecord ? new Decimal(stockRecord.current_stock) : null;
                                    return available !== null && available.lte(0);
                                })()}
                                className="h-9 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all active:scale-95 text-[10px] font-bold uppercase tracking-tight disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                            >
                                {isSubmitting ? "Adicionando..." : "Selecionar"}
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10">
                        <p className="text-xs text-gray-400 italic">Nenhuma variação disponível</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddComplementItemModal;
