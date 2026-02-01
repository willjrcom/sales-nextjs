import Item from "@/app/entities/order/item"
import { Badge } from "@/components/ui/badge"

interface AdditionalItemsProps {
    item: Item;
}


const AdditionalItemCard = ({ item }: AdditionalItemsProps) => {
    const flavorLabel = item.flavor ? ` (${item.flavor})` : '';
    return (
        <div className="px-2 py-1 text-sm">
            <Badge className="bg-green-500 hover:bg-green-600 text-white">
                {item.quantity} x {item.name}{flavorLabel}
            </Badge>
        </div>
    )
}

export default AdditionalItemCard