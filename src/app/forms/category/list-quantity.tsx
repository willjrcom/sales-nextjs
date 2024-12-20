import ButtonIconText from "@/app/components/button/button-icon-text";
import Carousel from "@/app/components/carousel/carousel";
import { useModal } from "@/app/context/modal/context";
import Category from "@/app/entities/category/category";
import Quantity from "@/app/entities/quantity/quantity";
import QuantityForm from "@/app/forms/quantity/form";

interface ListQuantityProps {
    category: Category;
}

const ListQuantity = ({ category }: ListQuantityProps) => {
    const modalHandler = useModal();
    if (category?.quantities === undefined || category?.quantities?.length === 0) category!.quantities = [];

    const onClose = (id?: string) => {
        if (id) modalHandler.hideModal("edit-quantity-" + id);
        else modalHandler.hideModal("new-quantity");
    }

    const onEdit = (quantity: Quantity) => {
        const modalName = "edit-quantity-" + quantity.id;
        const title = "Editar quantidade: " + quantity.quantity;
        const elem = <QuantityForm category={category} isUpdate={true} item={quantity} />
        modalHandler.showModal(modalName, title, elem, "md", () => onClose(quantity.id))
    }

    const quantities = [...(category?.quantities || [])].sort((a, b) => a.quantity - b.quantity)
    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Quantidades</h2>
            <div className="flex items-center space-x-4">
                <Carousel items={quantities}>
                    {(quantity) => (<div onClick={() => onEdit(quantity)}
                        key={quantity.id}
                        className="border p-2 rounded-md text-center bg-white ml-16 w-32"
                    >
                        {quantity.quantity}
                    </div>)}

                </Carousel>
                <ButtonIconText modalName="new-quantity" title="Quantidade">
                    <QuantityForm category={category} />
                </ButtonIconText>
            </div>
        </div>
    )
}

export default ListQuantity