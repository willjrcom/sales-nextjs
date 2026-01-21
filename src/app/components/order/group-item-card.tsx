import Decimal from "decimal.js";
import StatusComponent from "../button/show-status";
import ItemCard from "./item/card-item";
import GroupItem from "@/app/entities/order/group-item";
import RoundComponent from "../button/round-component";

interface GroupItemCardProps {
    group: GroupItem;
}

export default function GroupItemCard({ group }: GroupItemCardProps) {
    return (
        <li key={group.id} className="bg-gray-50 p-4 rounded-lg shadow-md mb-4">
            <div className="flex justify-between items-center mb-2">
                <p className="text-gray-700 font-semibold">
                    <span className="ml-2">
                        <StatusComponent status={group?.status} />
                    </span>
                </p>
                <div className="flex space-x-2">
                    <RoundComponent>Qtd: {group.quantity}</RoundComponent>
                    <RoundComponent>
                        Total: R$ {new Decimal(group.total_price).toFixed(2)}
                    </RoundComponent>
                </div>
            </div>

            {group.items?.map((item) => <ItemCard key={item.id} item={item} />)}
        </li>
    )
}