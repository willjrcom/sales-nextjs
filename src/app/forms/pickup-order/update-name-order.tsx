import React, { useState } from 'react';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/api/error';
import UpdatePickupOrderName from '@/app/api/order-pickup/update/name/[id]/route';
import { TextField } from '@/app/components/modal/field';
import OrderPickup from '@/app/entities/order/order-pickup';
import { useCurrentOrder } from '@/app/context/current-order/context';

interface PickupNameFormProps extends CreateFormsProps<OrderPickup> {
    pickupOrderId?: string;
}

const PickupNameForm = ({ item, pickupOrderId }: PickupNameFormProps) => {
    const modalName = 'edit-pickup-order-name-' + item?.id;
    const modalHandler = useModal();
    const contextCurrentOrder = useCurrentOrder();
    const [name, setName] = useState<string>(item?.name || '');
    const [error, setError] = useState<RequestError | null>(null);
    const { data } = useSession();

    const submit = async () => {
        if (!data || !pickupOrderId) return;
        
        if (name.length < 3) {
            setError(new RequestError('O nome deve ter no mínimo 3 caracteres'));
            return;
        }

        try {
            await UpdatePickupOrderName(pickupOrderId, name, data);
            setError(null);
            contextCurrentOrder.fetchData();
            modalHandler.hideModal(modalName);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    return (
        <>
            <TextField name='name' friendlyName='Nome' placeholder='Digite o nome' setValue={setName} value={name} optional/>
            {error && <p className='text-red-500'>{error.message}</p>}
            <ButtonsModal
                item={item!}
                name='Atualizar nome'
                onSubmit={submit}
            />
        </>
    );
    
};

export default PickupNameForm;