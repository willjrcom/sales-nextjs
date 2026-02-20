import Decimal from "decimal.js";
import StatusComponent from "../button/show-status";
import ItemCard from "./item-card";
import GroupItem from "@/app/entities/order/group-item";
import RoundComponent from "../button/round-component";
import { Button } from "@/components/ui/button";
import { FaPrint } from "react-icons/fa";
import printGroupItem from "../print/print-group-item";
import { Session } from "next-auth";
import { ToUtcDatetime } from "@/app/utils/date";
import RemovedItemCard from "../order/removed-item-card";

interface GroupItemCardProps {
    group: GroupItem;
    session: Session;
}

export default function GroupItemCard({ group, session }: GroupItemCardProps) {
    return (
        <li key={group.id} className="bg-gray-50 p-4 rounded-lg shadow-md mb-4">
            <div className="flex justify-between items-center mb-2">
                <p className="text-gray-700 font-semibold">
                    <span className="ml-2 flex items-center">
                        <StatusComponent status={group?.status} />
                        {group.observation && <RemovedItemCard value={group.observation} />}
                    </span>
                </p>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => { printGroupItem({ groupItemID: group.id, printerName: group.printer_name, session: session }) }}>
                        <FaPrint />
                    </Button>
                    {group.start_at && <RoundComponent>Agendado para: {ToUtcDatetime(group.start_at)}</RoundComponent>}
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