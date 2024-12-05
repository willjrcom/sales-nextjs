import Item from '@/app/entities/order/item';
import React from 'react';

interface AdditionalItemCardProps {
    item: Item;
}

const AdditionalItemCard = ({ item }: AdditionalItemCardProps) => {
    return (
        <div className="relative bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
            {/* Estado padrão */}
            <div className="flex justify-between items-center">
                <div className="flex justify-between items-center space-x-4">
                    <div className="text-sm font-medium">
                        {item.quantity} x {item.name}
                    </div>
                    <div className="text-lg font-bold">R$ {(item.quantity * item.price).toFixed(2)}</div>
                </div>
            </div>
        </div>
    );
};

export default AdditionalItemCard;
