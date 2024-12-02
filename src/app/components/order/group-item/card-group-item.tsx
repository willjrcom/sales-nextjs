import GroupItem, { StatusGroupItem } from "@/app/entities/order/group-item";
import { useGroupItem } from "@/app/context/group-item/context";
import ButtonEdit from "../../crud/button-edit";
import EditGroupItem from "./edit-group-item";
import { useCurrentOrder } from "@/app/context/current-order/context";
import { ToUtcDatetime } from "@/app/utils/date";
import { FaClock } from "react-icons/fa";

interface GroupItemCardProps {
  groupItem: GroupItem;
}

const GroupItemCard = ({ groupItem }: GroupItemCardProps) => {
  const contextGroupItem = useGroupItem();
  const contextCurrentOrder = useCurrentOrder();

  const showStatus = (status: string) => {
    const selectStatus = {
      ["Staging" as StatusGroupItem]: "bg-gray-200 text-gray-700",
      ["Pending" as StatusGroupItem]: "bg-yellow-100 text-yellow-800",
      ["Started" as StatusGroupItem]: "bg-blue-100 text-blue-800",
      ["Ready" as StatusGroupItem]: "bg-green-100 text-green-800",
      ["Finished" as StatusGroupItem]: "bg-red-100 text-red-800"
    }

    return selectStatus[status];
  };

  const setGroupItem = (groupItem: GroupItem) => {
    if (!contextGroupItem || !groupItem) return;
    contextGroupItem.updateGroupItem(groupItem);
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md space-y-4 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${showStatus(groupItem.status)}`}>
          {groupItem.status}
        </span>

        <div onClick={() => setGroupItem(groupItem)}>
          <ButtonEdit modalName={"edit-group-item-" + groupItem.id} name={""} size="xl" onCloseModal={contextCurrentOrder.fetchData}>
            <EditGroupItem key={groupItem.id} />
          </ButtonEdit>
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
        <FaClock/>&nbsp;Agendado para: {ToUtcDatetime(groupItem.start_at)}
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
            {item.additional_items && (
              <ul className="mt-2 pl-4 list-disc text-sm text-gray-600">
                {item.additional_items.map((add) => (
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
