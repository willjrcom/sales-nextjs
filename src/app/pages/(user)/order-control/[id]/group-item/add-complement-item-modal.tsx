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
import { useQueryClient } from "@tanstack/react-query";

interface AddComplementItemModalProps {
    product: Product;
}

const AddComplementItemModal = ({ product }: AddComplementItemModalProps) => {
    const { data } = useSession();
    const queryClient = useQueryClient();
    const modalHandler = useModal();
    const groupItem = queryClient.getQueryData<GroupItem | null>(['group-item', 'current']);

    const submit = async (variationId: string) => {
        if (!data) return
        if (!groupItem) return notifyError("Nenhum grupo de itens selecionado")

        try {
            await NewComplementGroupItem(groupItem.id, product.id, variationId, data)
            const updatedGroupItem = await GetGroupItemByID(groupItem.id, data);
            queryClient.setQueryData(['group-item', 'current'], updatedGroupItem);
            queryClient.invalidateQueries({ queryKey: ['order', 'current'] });
            modalHandler.hideModal("add-complement-item-group-item-" + groupItem?.id)
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao adicionar complemento");
        }
    }

    return (
        <div className="border rounded-lg bg-white overflow-hidden w-full max-w-sm mx-auto">
            {/* Header info with image */}
            <div className="flex items-center gap-3 p-2 bg-gray-50 border-b relative">
                {product.image_path ? (
                    <div className="relative w-12 h-12 bg-gray-100 rounded shrink-0 overflow-hidden">
                        <Image src={product.image_path} alt={product.name} fill className="object-cover" />
                    </div>
                ) : (
                    <div className="relative w-12 h-12 bg-gray-200 rounded shrink-0 flex items-center justify-center">
                        <span className="text-[10px] text-gray-400 text-center leading-none px-1">Img N/D</span>
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <h2 className="font-medium text-sm leading-tight text-gray-900 line-clamp-2 pr-12">{product.name}</h2>
                </div>

                {/* SKU */}
                <span className="absolute top-2 right-2 bg-gray-100 text-gray-600 border text-[10px] px-1.5 py-0.5 rounded font-mono">
                    #{product.sku}
                </span>
            </div>

            {/* botões de variação */}
            <div>
                {product.variations?.length > 0 ? (
                    product.variations.map((variation) => (
                        <div key={variation.id} className="flex items-center justify-between p-2 border-b last:border-0 hover:bg-gray-50">
                            <div>
                                <p className="text-sm text-gray-600">{typeof variation.size === 'string' ? variation.size : variation.size?.name}</p>
                                <p className="text-sm font-bold text-primary">
                                    R$ {new Decimal(variation.price).toFixed(2)}
                                </p>
                            </div>
                            <button
                                onClick={() => submit(variation.id)}
                                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-medium transition-colors"
                            >
                                <FaPlus size={10} />
                                <span>Adicionar</span>
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Nenhuma variação disponível (Tamanho)</p>
                )}
            </div>
        </div>
    );
};

export default AddComplementItemModal;
