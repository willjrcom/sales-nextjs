import React from 'react';
import ButtonDelete from '../../button/button-delete';
import DeleteComplementItemModal from './delete-complement-modal';
import GroupItem from '@/app/entities/order/group-item';

interface ComplementItemCardProps {
    item: GroupItem | null;
}

const ComplementItemCard = ({ item }: ComplementItemCardProps) => {
    if (!item?.complement_item) return
    
    return (
        <div className="relative bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
            {/* Estado padrão */}
            <div className="flex justify-between items-center">
                <div className="flex justify-between items-center space-x-4">
                    <div className="text-sm font-medium">
                        {item?.complement_item?.quantity} x {item?.complement_item?.name}
                    </div>
                    <div className="text-sm font-bold">R$ {(item.complement_item!.quantity * item.complement_item!.price).toFixed(2)}</div>
                </div>

                <div className='bg-red-100 p-1 rounded-full'>
                    <ButtonDelete modalName={"delete-complement-item-" + item.id} name={item.complement_item!.name}>
                        <DeleteComplementItemModal item={item} />
                    </ButtonDelete>
                </div>
            </div>
        </div>
    );
};

export default ComplementItemCard;
