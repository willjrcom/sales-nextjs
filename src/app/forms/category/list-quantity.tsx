import ButtonIconText from "@/app/components/button/button-icon-text";
import { useModal } from "@/app/context/modal/context";
import Category from "@/app/entities/category/category";
import Quantity from "@/app/entities/quantity/quantity";
import QuantityForm from "@/app/forms/quantity/form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import GetCategoryByID from "@/app/api/category/[id]/category";
import { useSession } from "next-auth/react";

interface ListQuantityProps {
    category: Category;
}

const ListQuantity = ({ category: initialCategory }: ListQuantityProps) => {
    const modalHandler = useModal();
    const { data: session } = useSession();

    // Usa useQuery para manter os dados sincronizados
    const { data: category } = useQuery({
        queryKey: ['category', initialCategory.id],
        queryFn: () => GetCategoryByID(initialCategory.id, session!),
        enabled: !!session && !!initialCategory.id,
        initialData: initialCategory,
    });

    const currentCategory = category || initialCategory;
    if (currentCategory?.quantities === undefined || currentCategory?.quantities?.length === 0) currentCategory!.quantities = [];

    const onClose = (id?: string) => {
        if (id) modalHandler.hideModal("edit-quantity-" + id);
        else modalHandler.hideModal("new-quantity");
    }

    const onEdit = (quantity: Quantity) => {
        const modalName = "edit-quantity-" + quantity.id;
        const title = "Editar quantidade: " + quantity.quantity;
        const elem = <QuantityForm category={currentCategory} isUpdate={true} item={quantity} />
        modalHandler.showModal(modalName, title, elem, "md", () => onClose(quantity.id))
    }

    const quantities = [...(currentCategory?.quantities || [])].sort((a, b) => a.quantity - b.quantity);
    const isDefaultCategory = !currentCategory.is_additional && !currentCategory.is_complement;

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Quantidades</h2>
            <div className="flex flex-wrap gap-4">
                {quantities.map((quantity) => (
                    <div
                        onClick={() => onEdit(quantity)}
                        key={quantity.id}
                        className="border p-2 rounded-md text-center bg-white w-32 cursor-pointer"
                    >
                        {quantity.quantity}
                    </div>
                ))}
                {isDefaultCategory && (
                    <ButtonIconText modalName="new-quantity" title="Quantidade">
                        <QuantityForm category={currentCategory} />
                    </ButtonIconText>
                )}
            </div>
        </div>
    )
}

export default ListQuantity