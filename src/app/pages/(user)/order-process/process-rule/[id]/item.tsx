import Item from "@/app/entities/order/item";
import AdditionalItem from "./additional-item";
import RemovedItem from "./removed-item";
import { useModal } from "@/app/context/modal/context";
import ItemDetails from "./item-details";
import Product from "@/app/entities/product/product";

interface ItemProcessOrderProps {
    item: Item;
    product?: Product;
}

const ItemProcessOrder = ({ item, product }: ItemProcessOrderProps) => {
    const modalHandler = useModal();

    const openItemDetails = () => {
        const onClose = () => {
            modalHandler.hideModal("item-details-" + item.id)
        }

        modalHandler.showModal("item-details-" + item.id, item.name,
            <ItemDetails item={item} product={product} />,
            'lg',
            onClose
        )
    }

    return (
    <div key={item.id} className='border p-2 mt-1 cursor-pointer' onClick={openItemDetails}>
        <p className="text-md text-gray-900">{item.quantity} x {item.name}</p>

        <div className="mt-2 flex flex-wrap gap-2">
            {item.additional_items?.map((additional) => (
                <AdditionalItem key={additional.id} item={additional} />
            ))}
        </div>
        <div className='mt-2 flex flex-wrap gap-2'>
            {item.removed_items?.map((removedItem) => (
                <RemovedItem key={removedItem} item={removedItem} />
            ))}
        </div>
        <div className="mt-2">
            {item.observation && <p className="text-sm font-bold text-red-500">OBS: {item.observation}</p>}
        </div>
    </div>
    )
}

export default ItemProcessOrder