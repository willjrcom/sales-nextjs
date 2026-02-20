import AdditionalItemCard from "@/app/components/order/additional-item-card";
import RemovedItemCard from "@/app/components/order/removed-item-card";
import Item from "@/app/entities/order/item";

interface ItemProcessProps {
    item: Item;
}

const ItemProcessCard = ({ item }: ItemProcessProps) => {
    return (
        <li key={item.id} className="flex bg-white rounded-lg shadow border-2 border-gray-200 p-3 items-center">
            {/* Right: item details */}
            <div className="flex-1">
                <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">{item.quantity} x {item.name}</span>
                </div>
                {item.flavor && (
                    <p className="text-sm text-orange-700 mt-1">Sabor selecionado: <span className="font-semibold">{item.flavor}</span></p>
                )}
                <div className="flex">
                    {item.observation && (
                        <RemovedItemCard value={item.observation} key={item.observation} />
                    )}
                    {item.additional_items?.map(add => (
                        <AdditionalItemCard item={add} key={add.id} />
                    ))}
                    {item.removed_items?.map(rem => (
                        <RemovedItemCard value={rem} key={rem} />
                    ))}
                </div>
            </div>
        </li>
    );
};

export default ItemProcessCard;
