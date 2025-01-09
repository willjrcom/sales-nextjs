import React from 'react';
import ButtonDelete from '../../button/button-delete';
import DeleteComplementItemModal from './delete-complement-modal';
import GroupItem from '@/app/entities/order/group-item';

interface ComplementItemCardProps {
    groupItem: GroupItem | null;
}

const ComplementItemCard = ({ groupItem }: ComplementItemCardProps) => {
    if (!groupItem?.complement_item) return

    const isGroupItemStaging = groupItem?.status === "Staging"

    return (
        <div className="relative bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
            {/* Estado padrão */}
            <div className="flex justify-between items-center">
                <div className="flex justify-between items-center space-x-4">
                    <div className="text-sm font-medium">
                        {groupItem?.complement_item?.quantity} x {groupItem?.complement_item?.name}
                    </div>
                    <div className="text-sm font-bold">R$ {(groupItem.complement_item!.quantity * groupItem.complement_item!.price).toFixed(2)}</div>
                </div>

                {isGroupItemStaging &&
                    <div className='bg-red-100 p-1 rounded-full'>
                        <ButtonDelete modalName={"delete-complement-item-" + groupItem.id} name={groupItem.complement_item!.name}>
                            <DeleteComplementItemModal item={groupItem} />
                        </ButtonDelete>
                    </div>}
            </div>
        </div>
    );
};

export default ComplementItemCard;
