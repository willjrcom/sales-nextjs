import Item from '@/app/entities/order/item';
import React, { useState } from 'react';

interface CardProps {
    item: Item;
}

const ItemCard = ({ item }: CardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Estado padrão */}
            <div className="flex justify-between items-center">
                <div className="text-sm font-medium">
                    {item.quantity} x {item.name}
                </div>
                <div className="text-lg font-bold">R$ {item.price}</div>
                <div className="ml-4 flex items-center justify-center w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full">
                    {item.additional_items?.length || 0}
                </div>
            </div>

            {/* Hover para detalhes */}
            {isHovered && (
                <div className="mt-2">
                    <ul className="list-disc text-sm pl-4">
                        {item.additional_items?.map((additionalItem, index) => (
                            <li key={index} className="flex justify-between">
                                <span>{additionalItem.quantity} x {additionalItem.name}</span>
                                <span className="text-gray-500">R$ {additionalItem.price}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ItemCard;
