import Item from "@/app/entities/order/item"

interface AdditionalItemsProps {
    item: Item;
}

const AdditionalItem = ({ item }: AdditionalItemsProps) => {
    return (
        <span className="px-2 py-1 text-sm rounded-lg bg-green-500 text-white">
            {item.quantity} x {item.name}
        </span>
    )
}

export default AdditionalItem