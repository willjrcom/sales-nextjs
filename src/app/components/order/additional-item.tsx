import Item from "@/app/entities/order/item"

interface AdditionalItemsProps {
    item: Item;
}

const AdditionalItem = ({ item }: AdditionalItemsProps) => {
    const flavorLabel = item.flavor ? ` (${item.flavor})` : '';
    return (
        <span className="px-2 py-1 text-sm rounded-lg bg-green-500 text-white">
            {item.quantity} x {item.name}{flavorLabel}
        </span>
    )
}

export default AdditionalItem