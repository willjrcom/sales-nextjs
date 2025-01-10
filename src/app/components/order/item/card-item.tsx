import Item from '@/app/entities/order/item';
import React, { useState } from 'react';
import { useModal } from '@/app/context/modal/context';
import EditItem from './edit-item';
import ButtonDelete from '../../button/button-delete';
import DeleteItemModal from './delete-item-modal';
import { useGroupItem } from '@/app/context/group-item/context';

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

    totalPrice += item.additional_items?.reduce((total, item) => total + (item.quantity * item.price), 0) || 0;
    const isGroupItemStaging = contextGroupItem.groupItem?.status === "Staging"

    return (
        <div
            className="relative bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Estado padrão */}
            <div className="flex justify-between items-center">
                <div className="flex justify-between items-center space-x-4 w-full h-full"
                    onClick={() => modalHandler.showModal(modalName, item.name, <EditItem item={item} />, "md", onClose)}
                >
                    <div className="text-sm font-medium">
                        {item.quantity} x {item.name}
                    </div>
                    <div className="text-sm font-bold">R$ {totalPrice.toFixed(2)}</div>

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
                </div>
                &nbsp;
                {isGroupItemStaging && (
                    <div className="bg-red-100 p-1 rounded-full">
                        <ButtonDelete modalName={"delete-item-" + item.id} name={item.name}>
                            <DeleteItemModal item={item} />
                        </ButtonDelete>
                    </div>
                )}
            </div>

            {/* Hover para detalhes */}
            {/* {isHovered && (
                item.additional_items?.map((additionalItem, index) => (
                    <AdditionalItemCard key={index} item={additionalItem} />
                ))
            )}
            {isHovered && (
                item.removed_items?.map((item, index) => (
                    <RemovedItemCard key={index} item={item} />
                ))
            )} */}
        </div>
    );

};

export default ItemCard;
