import GroupItem from "@/app/entities/order/group-item";
import { useGroupItem } from "@/app/context/group-item/context";
import ButtonIcon from "../../button/button-icon";
import EditGroupItem from "./edit-group-item";
import { useCurrentOrder } from "@/app/context/current-order/context";
import { ToUtcDatetime } from "@/app/utils/date";
import { FaClock } from "react-icons/fa";
import StatusComponent from "../../button/show-status";

interface GroupItemCardProps {
  groupItem: GroupItem;
}

const GroupItemCard = ({ groupItem }: GroupItemCardProps) => {
  const contextGroupItem = useGroupItem();
  const contextCurrentOrder = useCurrentOrder();

  const setGroupItem = (groupItem: GroupItem) => {
    if (!contextGroupItem || !groupItem) return;
    contextGroupItem.updateGroupItem(groupItem);
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md space-y-4 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center">
        <StatusComponent status={groupItem.status} />

        <div onClick={() => setGroupItem(groupItem)}>
          <ButtonIcon modalName={"edit-group-item-" + groupItem.id} size="xl" onCloseModal={contextCurrentOrder.fetchData}>
            <EditGroupItem key={groupItem.id} />
          </ButtonIcon>
        </div>
      </div>

      <div className="flex justify-between items-center"></div>
      <div className="flex items-center space-x-4">
        <p className="text-sm">
          <strong>Quantidade total:</strong> {groupItem.quantity}
        </p>
        <p className="text-sm font-bold text-gray-800">
          R$ {groupItem.total_price.toFixed(2)}
        </p>

      </div>

      {/* Schedule */}
      {groupItem.start_at && <p className="text-sm font-bold text-gray-800 flex items-center">
        <FaClock />&nbsp;Agendado para: {ToUtcDatetime(groupItem.start_at)}
      </p>}

      {/* Itens */}
      <div className="space-y-3">
        <h3 className="text-md font-semibold border-b pb-2">Itens</h3>
        {groupItem.items.map((item) => (
          <div className="bg-gray-50 p-3 rounded shadow-sm" key={item.id}>
            <div className="flex justify-between">
              <p className="font-bold">{item.quantity} x {item.name}</p>
            </div>
            <p className="text-sm font-semibold">R$ {item.price.toFixed(2)}</p>
            {item.item_to_additional && (
              <ul className="mt-2 pl-4 list-disc text-sm text-gray-600">
                {item.item_to_additional.map((add) => (
                  <li key={add.id}>
                    {add.name} - R$ {add.price.toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Complemento */}
      {groupItem.complement_item && (
        <div className="bg-gray-100 p-3 rounded-lg shadow-sm">
          <h3 className="text-md font-semibold border-b pb-2">Complemento</h3>
          <div className="flex justify-between">
            <p className="text-gray-700">{groupItem.complement_item.name}</p>
            <p className="font-semibold">R$ {groupItem.complement_item.price.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
};




export default GroupItemCard;
