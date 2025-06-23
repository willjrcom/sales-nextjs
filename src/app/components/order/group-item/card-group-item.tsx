"use client";
import GroupItem from "@/app/entities/order/group-item";
import { useGroupItem } from "@/app/context/group-item/context";
import ButtonIcon from "../../button/button-icon";
import EditGroupItem from "./edit-group-item";
import { useCurrentOrder } from "@/app/context/current-order/context";
import { ToUtcDatetime } from "@/app/utils/date";
import { FaClock } from "react-icons/fa";
import StatusComponent from "../../button/show-status";
import Decimal from "decimal.js";
import ObservationCard from "../observation";

interface GroupItemCardProps {
  groupItem: GroupItem;
}

const GroupItemCard = ({ groupItem }: GroupItemCardProps) => {
  const contextGroupItem = useGroupItem();
  const contextCurrentOrder = useCurrentOrder();
  // Map status to border color
  const statusStyles: Record<string, string> = {
    Staging: 'border-yellow-400',
    Pending: 'border-blue-400',
    Ready: 'border-green-400',
    Finished: 'border-gray-400',
    Canceled: 'border-red-400',
  };

  const setGroupItem = (groupItem: GroupItem) => {
    if (!contextGroupItem || !groupItem) return;
    contextGroupItem.updateGroupItem(groupItem);
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${statusStyles[groupItem.status] || 'border-gray-200'} p-4 space-y-4 max-h-[50vh] overflow-y-auto`}>
      {/* Header: Group title and actions */}
      <div className="flex items-center justify-between">
        <StatusComponent status={groupItem.status} />
        <div onClick={() => setGroupItem(groupItem)}>
          <ButtonIcon
            title="Editar grupo"
            modalName={`edit-group-item-${groupItem.id}`}
            size={groupItem.status === 'Staging' ? 'xl' : 'md'}
            onCloseModal={() => contextCurrentOrder.fetchData(contextCurrentOrder.order?.id)}
          >
            <EditGroupItem key={groupItem.id} />
          </ButtonIcon>
        </div>
      </div>

      {/* Summary */}
      <dl className="grid grid-cols-2 gap-2 text-gray-700">
        <div>
          <dt className="font-medium">Quantidade total</dt>
          <dd className="mt-1">{groupItem.quantity}</dd>
        </div>
        <div>
          <dt className="font-medium">Total</dt>
          <dd className="mt-1 font-semibold">R$ {new Decimal(groupItem.total_price).toFixed(2)}</dd>
        </div>
      </dl>

      {/* Schedule */}
      {groupItem.start_at && (
        <p className="flex items-center text-sm text-gray-600">
          <FaClock className="mr-2 text-gray-500" />
          Agendado para: <span className="font-medium ml-1">{ToUtcDatetime(groupItem.start_at)}</span>
        </p>
      )}

      {/* Observation */}
      {groupItem.observation && (
        <ObservationCard observation={groupItem.observation} />
      )}

      {/* Items List */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-1">Itens</h3>
        {groupItem.items.map((item) => (
          <div key={item.id} className="grid grid-cols-3 gap-2 bg-gray-50 p-2 rounded shadow-inner">
            <div className="col-span-2">
              <p className="font-medium">{item.quantity} x {item.name}</p>
              {item.observation && (
                <ObservationCard observation={item.observation} />
              )}
              {item.additional_items && item.additional_items?.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-sm text-green-700">
                  {item.additional_items.map(add => (
                    <li key={add.id}>{add.quantity} x {add.name} (+R$ {new Decimal(add.price).toFixed(2)})</li>
                  ))}
                </ul>
              )}
              {item.removed_items && item.removed_items?.length > 0 && (
                <ul className="mt-1 list-disc list-inside text-sm text-red-600">
                  {item.removed_items.map(rem => (
                    <li key={rem}>- {rem}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-span-1 flex items-center justify-end">
              <p className="font-semibold text-gray-800">R$ {new Decimal(item.total_price).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Complemento */}
      {groupItem.complement_item && (
        <div className="bg-gray-100 p-3 rounded-lg shadow-sm">
          <h3 className="text-md font-semibold border-b pb-2">Complemento</h3>
          <div className="flex justify-between">
            <p className="text-gray-700">{groupItem.complement_item.quantity} x {groupItem.complement_item.name}</p>
            <p className="font-semibold">R$ {new Decimal(groupItem.complement_item.price).toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
};




export default GroupItemCard;
