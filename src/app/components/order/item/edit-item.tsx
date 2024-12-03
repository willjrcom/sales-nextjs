import Item from '@/app/entities/order/item';
import React from 'react';
import DeleteItemModal from './delete-item-modal';
import ButtonDelete from '../../button/button-delete';
import AdditionalItemList from './list-additional-item';

interface EditItemProps {
    item: Item;
}

const EditItem = ({ item }: EditItemProps) => {
    if (!item) return

    return (
        <div
            className="relative bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
        >
            {/* Estado padrão */}
            <div className="flex justify-between items-center">
                <div className="text-sm font-medium">
                    {item.quantity} x {item.name}
                </div>
                <ButtonDelete modalName={"delete-item-" + item.id} name={item.name}><DeleteItemModal item={item} /></ButtonDelete>
                <div className="text-lg font-bold">R$ {item.price}</div>
                <div className="ml-4 flex items-center justify-center w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full">
                    {item.additional_items?.length || 0}
                </div>
            </div>

            <AdditionalItemList item={item} />
        </div>
    );
};

export default EditItem;