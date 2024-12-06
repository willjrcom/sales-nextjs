import Item from '@/app/entities/order/item';
import React, { useState } from 'react';
import { useModal } from '@/app/context/modal/context';
import EditItem from './edit-item';
import ButtonDelete from '../../button/button-delete';
import DeleteItemModal from './delete-item-modal';
import { useGroupItem } from '@/app/context/group-item/context';
import AdditionalItemCard from './additional-item';

interface CardProps {
    item: Item;
}

const ItemCard = ({ item }: CardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const contextGroupItem = useGroupItem();
    const modalHandler = useModal();
    const modalName = "edit-item-" + item.id;

    const onClose = () => {
        contextGroupItem.fetchData(contextGroupItem.groupItem?.id || "");
        modalHandler.hideModal(modalName);
    };

    let totalPrice = item.quantity * item.price;

    totalPrice += item.item_to_additional?.reduce((total, item) => total + (item.quantity * item.price), 0) || 0;
    return (
        <div
            className="relative bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Estado padrão */}
            <div className="flex justify-between items-center">
                <div className="flex justify-between items-center space-x-4" onClick={() => modalHandler.showModal(modalName, item.name, <EditItem item={item} />, "md", onClose)}>
                    <div className="text-sm font-medium">
                        {item.quantity} x {item.name}
                    </div>
                    <div className="text-sm font-bold">R$ {totalPrice.toFixed(2)}</div>
                    {item.item_to_additional?.length && <div className="ml-4 flex items-center justify-center w-6 h-6 bg-green-500 text-white text-sm font-bold rounded-full">
                        {item.item_to_additional?.reduce((total, item) => total + item.quantity, 0)}
                    </div>}
                </div>
                &nbsp;
                <div className='bg-red-100 p-1 rounded-full'>
                    <ButtonDelete modalName={"delete-item-" + item.id} name={item.name}><DeleteItemModal item={item} /></ButtonDelete>
                </div>
            </div>

            {/* Hover para detalhes */}
            {isHovered && (
                item.item_to_additional?.map((additionalItem, index) => (
                    <AdditionalItemCard key={index} item={additionalItem} />
                ))
            )}
        </div>
    );
};

export default ItemCard;
