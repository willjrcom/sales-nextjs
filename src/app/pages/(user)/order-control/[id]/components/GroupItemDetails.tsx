
import React, { useEffect, useState } from 'react';
import GroupItem from '@/app/entities/order/group-item';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import GroupItemForm from '@/app/forms/group-item/form';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FaPlus, FaTrash } from 'react-icons/fa';
import ListComplementItems from '../group-item/list-complement-items';
import Decimal from 'decimal.js';
import ButtonDelete from '@/app/components/button/button-delete';
import DeleteComplementItemModal from '../group-item/delete-complement-modal';

interface GroupItemDetailsProps {
    groupItem: GroupItem;
    isStaging: boolean;
}

export const GroupItemDetails = ({ groupItem, isStaging }: GroupItemDetailsProps) => {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [complementModalOpen, setComplementModalOpen] = useState(false);

    // Reset modal state if complement is already present to prevent auto-reopening after deletion
    useEffect(() => {
        if (groupItem.complement_item) {
            setComplementModalOpen(false);
        }
    }, [groupItem.complement_item]);

    const handleOpenComplementModal = () => {
        // Set current group item so ListComplementItems can use it
        queryClient.setQueryData(['group-item', 'current'], groupItem);
        setComplementModalOpen(true);
    };

    const handleFormSuccess = () => {
        // Invalidate order to refresh the list
        queryClient.invalidateQueries({ queryKey: ['order', 'current'] });
    };

    // Close modal when query data changes (complement added)? 
    // ListComplementItems likely handles the add logic and doesn't auto-close this modal, 
    // but looking at ListComplementItems -> AddComplementItemModal, it might.
    // Let's rely on manual close or inner component behavior for now.

    return (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">

            {/* Action Buttons (Observation, Schedule) */}
            {isStaging && (
                <div className="flex gap-2 justify-end">
                    <GroupItemForm item={groupItem} onSuccess={handleFormSuccess} />
                </div>
            )}

            {/* Complement Section */}
            <div>
                {/* Complement Header / Add Button */}
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-700">Complemento</p>
                    {isStaging && !groupItem.complement_item && (
                        <Dialog open={complementModalOpen} onOpenChange={setComplementModalOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                                    onClick={handleOpenComplementModal}
                                >
                                    <FaPlus size={10} /> Adicionar
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                    <DialogTitle>Adicionar complemento para {groupItem.items?.[0]?.name || 'Item'}</DialogTitle>
                                </DialogHeader>
                                <div className="py-2">
                                    <ListComplementItems />
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* Selected Complement Display */}
                {groupItem.complement_item ? (
                    <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center border border-gray-200">
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {groupItem.complement_item.quantity}x {groupItem.complement_item.name}
                            </p>
                            <p className="text-xs text-gray-500 font-semibold">
                                + R$ {new Decimal(groupItem.complement_item.price).times(groupItem.complement_item.quantity).toFixed(2)}
                            </p>
                        </div>
                        {isStaging && (
                            <div onClick={() => queryClient.setQueryData(['group-item', 'current'], groupItem)}>
                                <ButtonDelete
                                    modalName={`delete-complement-${groupItem.id}`}
                                    name={groupItem.complement_item.name}
                                >
                                    <DeleteComplementItemModal />
                                </ButtonDelete>
                            </div>
                        )}
                    </div>
                ) : (
                    !isStaging && <p className="text-xs text-gray-400 italic">Sem complemento</p>
                )}
            </div>
        </div>
    );
};
