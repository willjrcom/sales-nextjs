import ObservationCard from "./observation";
import AdditionalItem from "@/app/components/order/additional-item";
import RemovedItem from "@/app/components/order/removed-item";
import Item from "@/app/entities/order/item";
import RoundComponent from "../button/round-component";
import Decimal from "decimal.js";

interface ItemCardProps {
    item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
    return (
        <div key={item.id} className="text-gray-700 ml-4 py-2 border shadow rounded-md p-2 m-2">
            <div className="flex space-x-2 items-center justify-between">
                <p className="font-semibold">{item.quantity} x {item.name}</p>
                <RoundComponent>
                    Total: R$ {new Decimal(item.total_price).toFixed(2)}
                </RoundComponent>
            </div>

            {item.observation && <ObservationCard observation={item.observation} />}
            {item.additional_items?.map((add) => (
                <AdditionalItem item={add} key={add.id} />
            ))}
            {item.removed_items?.map((rem) => (
                <RemovedItem item={rem} key={rem} />
            ))}
        </div>
    )
}