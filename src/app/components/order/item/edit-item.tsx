import Item from '@/app/entities/order/item';
import React from 'react';
import DeleteItemModal from './delete-item-modal';
import ButtonDelete from '../../button/button-delete';
import AdditionalItemList from './list-additional-item';
import RemovedItemList from './list-removed-item';

interface EditItemProps {
    item: Item;
}

const EditItem = ({ item }: EditItemProps) => {
    const [itemState, setItemState] = React.useState<Item>(item);

    if (!itemState) return

    return (
        <div
            className="relative bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
        >
            {/* Estado padrão */}
            <div className="flex justify-between items-center">
                <div className="text-sm font-medium">
                    {itemState.quantity} x {itemState.name}
                </div>
                <ButtonDelete modalName={"delete-item-" + itemState.id} name={itemState.name}><DeleteItemModal item={itemState} /></ButtonDelete>
            </div>
            {itemState.observation && <p className="text-sm text-gray-600">{itemState.observation}</p>}
            <AdditionalItemList item={itemState} setItem={setItemState} />
            <RemovedItemList item={itemState} />
            
            <hr className="my-4" />
            <div className="flex justify-between items-center">
                <p className="text-lg font-bold">Total</p>
                <p className="text-lg font-bold">R$ {itemState.total_price.toFixed(2)}</p>
            </div>
        </div>
    );
};

export default EditItem;
