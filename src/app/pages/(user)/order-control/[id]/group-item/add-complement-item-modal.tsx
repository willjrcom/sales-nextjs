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

    const submit = async () => {
        if (!data) return
        if (!groupItem) return notifyError("Nenhum grupo de itens selecionado")

        try {
            await NewComplementGroupItem(groupItem.id, product.id, data)
            const updatedGroupItem = await GetGroupItemByID(groupItem.id, data);
            queryClient.setQueryData(['group-item', 'current'], updatedGroupItem);
            modalHandler.hideModal("add-complement-item-group-item-" + groupItem?.id)
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao adicionar complemento");
        }
    }

    return (
        <div className="relative p-4 bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow duration-200 w-full max-w-sm mx-auto">
            {/* Imagem do produto */}
            <div className="relative flex justify-center items-center">
                {product.image_path ? (
                    <Image
                        src={product.image_path}
                        alt={`Imagem do produto ${product.name}`}
                        width={200}
                        height={130}
                        className="rounded-lg mb-2 object-cover"
                    />
                ) : (
                    <div
                        className="rounded-lg mb-2 bg-gray-200 flex items-center justify-center"
                        style={{ width: '200px', height: '130px' }}
                    >
                        <span className="text-gray-500 text-center">Imagem não disponível</span>
                    </div>
                )}

                {/* SKU do produto */}
                <span
                    className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded-lg opacity-80"
                    aria-label={`SKU do produto ${product.sku}`}
                >
                    #&nbsp;{product.sku}
                </span>
            </div>

            {/* Informações do Produto */}
            <div className="text-center">
                <h2 className="font-bold text-lg mb-1">{product.name}</h2>
                <p className="text-gray-600 mb-2">
                    {product.variations?.length > 0 ? (
                        `R$ ${new Decimal(Math.min(...product.variations.map(v => new Decimal(v.price).toNumber()))).toFixed(2)}`
                    ) : (
                        'Indisponível'
                    )}
                </p>
            </div>

            {/* botão */}
            <div className="flex items-center justify-between space-x-2">
                {/* Botão para adicionar */}
                <button onClick={submit} className={`flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max`}>
                    <FaPlus />
                </button>
            </div>
        </div>
    );
};

export default AddComplementItemModal;
