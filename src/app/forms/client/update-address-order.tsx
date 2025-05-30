import React, { useEffect, useState } from 'react';
import ButtonsModal from '../../components/modal/buttons-modal';
import Client, { ValidateClientForm } from '@/app/entities/client/client';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import UpdateClient from '@/app/api/client/update/client';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import AddressForm from '../address/form';
import Address from '@/app/entities/address/address';
import UpdateAddressOrderDelivery from '@/app/api/order-delivery/update/address/order-delivery';
import { updateClient } from '@/redux/slices/clients';

interface ClientAddressFormProps extends CreateFormsProps<Client> {
    deliveryOrderId?: string;
}

const ClientAddressForm = ({ item, deliveryOrderId }: ClientAddressFormProps) => {
    const modalName = 'edit-client-' + item?.id;
    const modalHandler = useModal();
    const [client, setClient] = useState<Client>(item as Client)
    const [address, setAddress] = useState<Address>(client.address)
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const { data } = useSession();

    useEffect(() => {
        setClient({ ...client, address: address })
    }, [address, client])

    const submit = async () => {
        if (!data || !deliveryOrderId) return;
        const validationErrors = ValidateClientForm(client);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);
        
        try {
            await UpdateClient(client, data);
            await UpdateAddressOrderDelivery(deliveryOrderId, data)

            updateClient({ type: "UPDATE", payload: {id: client.id, changes: client}});
            notifySuccess('Endereço atualizado com sucesso');
            modalHandler.hideModal(modalName);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao atualizar endereço');
        }
    }

    return (
        <>
            <AddressForm addressParent={client.address} setAddressParent={setAddress} />
            <ErrorForms errors={errors} />
            <ButtonsModal
                item={client}
                name='Editar endereço'
                onSubmit={submit}
            />
        </>
    );
    
};

export default ClientAddressForm;