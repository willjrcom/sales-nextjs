import ButtonIconText from "@/app/components/button/button-icon-text";
import { useModal } from "@/app/context/modal/context";
import Quantity from "@/app/entities/quantity/quantity";
import QuantityForm from "@/app/forms/quantity/form";
import { CategoryFormProps } from "./page";

const ListQuantity = ({ item: category, setItem: setCategory }: CategoryFormProps) => {
    const modalHandler = useModal();
    if (category?.quantities === undefined || category?.quantities?.length === 0) category!.quantities = [];

    const onClose = (id?: string) => {
        if (id) modalHandler.hideModal("edit-quantity-" + id);
        else modalHandler.hideModal("new-quantity");
    }

    const onEdit = (quantity: Quantity) => {
        const modalName = "edit-quantity-" + quantity.id;
        const title = "Editar quantidade: " + quantity.quantity;
        const elem = <QuantityForm category={category} setCategory={setCategory} isUpdate={true} item={quantity} />
        modalHandler.showModal(modalName, title, elem, "md", () => onClose(quantity.id))
    }

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Quantidades</h2>
            <div className="flex items-center space-x-4">
                {category?.quantities?.map((quantity, index) => (
                    <div onClick={() => onEdit(quantity)}
                        key={index}
                        className="border p-2 rounded-md text-center bg-white w-16"
                    >
                        {quantity.quantity}
                    </div>
                ))}
                <ButtonIconText modalName="new-quantity" title="Nova quantidade">
                    <QuantityForm category={category} setCategory={setCategory} />
                </ButtonIconText>
            </div>
        </div>
    )
}

export default ListQuantity