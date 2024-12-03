import Item from '@/app/entities/order/item';
import React, { useState } from 'react';
import { useModal } from '@/app/context/modal/context';
import EditItem from './edit-item';
import ButtonDelete from '../../button/button-delete';
import DeleteItemModal from './delete-item-modal';

interface CardProps {
    item: Item;
}

const ItemCard = ({ item }: CardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const modalHandler = useModal();
    const modalName = "edit-item-" + item.id;

    const onClose = () => {
        modalHandler.hideModal(modalName);
    };

    return (
        <div
            className="relative bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Estado padrão */}
            <div className="flex justify-between items-center" onClick={() => modalHandler.showModal(modalName, item.name, <EditItem item={item} />, "md", onClose)}>
                <div className="text-sm font-medium">
                    {item.quantity} x {item.name}
                </div>
                <div className="text-lg font-bold">R$ {item.price.toFixed(2)}</div>
                <div className="ml-4 flex items-center justify-center w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full">
                    {item.additional_items?.length || 0}
                </div>
                <ButtonDelete modalName={"delete-item-" + item.id} name={item.name}><DeleteItemModal item={item} /></ButtonDelete>
            </div>

            {/* Hover para detalhes */}
            {isHovered && (
                item.additional_items?.map((additionalItem, index) => (
                    <ItemCard key={index} item={additionalItem} />
                ))
            )}
        </div>
    );
};

export default ItemCard;
