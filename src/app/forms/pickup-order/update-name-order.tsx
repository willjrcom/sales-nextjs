import React, { useState } from 'react';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import UpdatePickupOrderName from '@/app/api/order-pickup/update/name/[id]/order-pickup';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { TextField } from '@/app/components/modal/field';
import OrderPickup from '@/app/entities/order/order-pickup';
import { useQueryClient } from '@tanstack/react-query';

interface PickupNameFormProps extends CreateFormsProps<OrderPickup> {
    pickupOrderId?: string;
}

const PickupNameForm = ({ item, pickupOrderId }: PickupNameFormProps) => {
    const modalName = 'edit-pickup-order-name-' + item?.id;
    const modalHandler = useModal();
    const queryClient = useQueryClient();
    const [name, setName] = useState<string>(item?.name || '');
    const [isSaving, setIsSaving] = useState(false);
    const { data } = useSession();

    const submit = async () => {
        if (!data || !pickupOrderId) return;

        if (name.length < 3) {
            notifyError('O nome deve ter no mínimo 3 caracteres');
            return;
        }

        setIsSaving(true);
        try {
            await UpdatePickupOrderName(pickupOrderId, name, data);
            // Invalidar queries do pedido
            queryClient.invalidateQueries({ queryKey: ['order'] });
            notifySuccess('Nome atualizado com sucesso');
            modalHandler.hideModal(modalName);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao atualizar nome');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <>
            <TextField name='name' friendlyName='Nome' placeholder='Digite o nome' setValue={setName} value={name} optional />
            <ButtonsModal
                item={item!}
                name='Atualizar nome'
                onSubmit={submit}
                isPending={isSaving}
            />
        </>
    );

};

export default PickupNameForm;