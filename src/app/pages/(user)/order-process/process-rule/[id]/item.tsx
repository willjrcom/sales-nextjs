import Item from "@/app/entities/order/item";
import AdditionalItem from "./additional-item";
import RemovedItem from "./removed-item";
import { useModal } from "@/app/context/modal/context";
import ItemDetails from "./item-details";

interface ItemProcessOrderProps {
    item: Item;
}

const ItemProcessOrder = ({ item }: ItemProcessOrderProps) => {
    const modalHandler = useModal();

    const openItemDetails = (item: Item) => {
        const onClose = () => {
            modalHandler.hideModal("item-details-" + item.id)
        }

        modalHandler.showModal("item-details-" + item.id, item.name,
            <ItemDetails item={item} />,
            'lg',
            onClose
        )
    }

    return (
    <div key={item.id} className='border p-2 mt-1 cursor-pointer' onClick={() => openItemDetails(item)}>
        <p className="text-md text-gray-900">{item.quantity} x {item.name}</p>

        <div className="mt-2 flex flex-wrap gap-2">
            {item.item_to_additional?.map((additional) => (
                <AdditionalItem key={additional.id} item={additional} />
            ))}
        </div>
        <div className='mt-2 flex flex-wrap gap-2'>
            {item.removed_items?.map((removedItem) => (
                <RemovedItem key={removedItem} item={removedItem} />
            ))}
        </div>
    </div>
    )
}

export default ItemProcessOrder