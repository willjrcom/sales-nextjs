import Decimal from 'decimal.js';
import Item from '@/app/entities/order/item';
import React from 'react';
import { useModal } from '@/app/context/modal/context';
import EditItem from './edit-item';
import ButtonDelete from '../../button/button-delete';
import DeleteItemModal from './delete-item-modal';
import { useQueryClient } from '@tanstack/react-query';
import GroupItem from '@/app/entities/order/group-item';

interface CardProps {
    item: Item;
}

const ItemCard = ({ item }: CardProps) => {
    const queryClient = useQueryClient();
    const groupItem = queryClient.getQueryData<GroupItem | null>(['group-item', 'current']);
    const modalHandler = useModal();
    const modalName = "edit-item-" + item.id;

    const onClose = () => {
        if (groupItem?.id) {
            queryClient.invalidateQueries({ queryKey: ['group-item', 'current'] });
        }
        modalHandler.hideModal(modalName);
    };

    // Calcular preço total com Decimal
    let totalPriceDecimal = new Decimal(item.price).times(item.quantity);
    const totalAdditionalsDecimal = item.additional_items?.reduce(
        (total: Decimal, it) => new Decimal(total).plus(new Decimal(it.price).times(it.quantity)),
        new Decimal(0)
    ) || new Decimal(0);
    totalPriceDecimal = totalPriceDecimal.plus(totalAdditionalsDecimal);
    const isGroupItemStaging = groupItem?.status === "Staging"

    return (
        <div
            className="relative bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg cursor-pointer"
        >
            {/* Estado padrão */}
            <div className="flex justify-between items-center">
                <div className="flex justify-between items-center space-x-4 w-full h-full"
                    onClick={() => modalHandler.showModal(modalName, item.name, <EditItem item={item} itemsCount={1} />, "md", onClose)}
                >
                    <div className="text-sm font-medium">
                        {item.quantity} x {item.name}
                    </div>

                    {/* Count additionals */}
                    {(item.additional_items?.length || 0 > 0) && (
                        <div className="ml-4 flex items-center justify-center w-6 h-6 bg-green-500 text-white text-sm font-bold rounded-full">
                            {item.additional_items?.reduce((total, item) => total + item.quantity, 0)}
                        </div>
                    )}

                    {/* Count removed */}
                    {(item.removed_items?.length || 0 > 0) && (
                        <div className="ml-4 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-sm font-bold rounded-full">
                            {item.removed_items?.reduce((total) => total + 1, 0)}
                        </div>
                    )}

                    <div className="text-sm font-bold">R$ {totalPriceDecimal.toFixed(2)}</div>
                </div>
                &nbsp;
                {isGroupItemStaging && (
                    <div className="bg-red-100 p-1 rounded-full">
                        <ButtonDelete modalName={"delete-item-" + item.id} name={item.name}>
                            <DeleteItemModal item={item} itemsCount={1} />
                        </ButtonDelete>
                    </div>
                )}
            </div>
        </div>
    );

};

export default ItemCard;
