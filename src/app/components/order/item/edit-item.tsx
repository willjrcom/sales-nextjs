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
            </div>

            <AdditionalItemList item={item} />

            <hr className="my-4" />
            <div className="flex justify-between items-center">
                <p className="text-lg font-bold">Total</p>
                <p className="text-lg font-bold">R$ {item.price.toFixed(2)}</p>
            </div>
        </div>
    );
};

export default EditItem;
