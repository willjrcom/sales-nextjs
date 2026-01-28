import Decimal from 'decimal.js';
import Item from '@/app/entities/order/item';
import { useEffect, useMemo, useState } from 'react';
import DeleteItemModal from './delete-item-modal';
import ButtonDelete from '../../../../../components/button/button-delete';
import ListAdditionalItems from './list-additional-items';
import ListRemovedItems from './list-removed-items';
import GroupItem from '@/app/entities/order/group-item';
import { useQueryClient } from '@tanstack/react-query';

interface EditItemProps {
    item: Item;
    itemsCount?: number;
}

const EditItem = ({ item, itemsCount }: EditItemProps) => {
    const queryClient = useQueryClient();
    const groupItem = queryClient.getQueryData<GroupItem | null>(['group-item', 'current']);
    const isStaging = groupItem?.status === "Staging"

    if (!item) return

    const totalAdditionalsDecimal = useMemo(() => item.additional_items?.reduce(
        (total: Decimal, it) => new Decimal(total).plus(new Decimal(it.price).times(it.quantity)),
        new Decimal(0)
    ) || new Decimal(0), [item.additional_items]);

    return (
        <div
            className="relative bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
        >
            {/* Estado padrão */}
            <div className="flex justify-between items-center">
                <div className="text-sm font-medium">
                    {item.quantity} x {item.name}
                </div>
                {isStaging &&
                    <ButtonDelete modalName={"delete-item-" + item.id} name={item.name} additionalModals={["edit-item-" + item.id]}>
                        <DeleteItemModal item={item} itemsCount={itemsCount} />
                    </ButtonDelete>
                }
            </div>
            {item.observation && <p className="text-sm text-gray-600">{item.observation}</p>}
            <ListAdditionalItems item={item} />
            <ListRemovedItems item={item} />

            <hr className="my-4" />
            <div className="flex justify-between items-center">
                <p className="text-md">Produto</p>
                <p className="text-lg font-bold">R$ {new Decimal(item.price).toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center">
                <p className="text-md">Adicionais</p>
                <p className="text-lg font-bold">R$ {totalAdditionalsDecimal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center">
                <p className="text-lg font-bold">Total</p>
                <p className="text-lg font-bold">R$ {new Decimal(item.total_price).toFixed(2)}</p>
            </div>
        </div>
    );
};

export default EditItem;
