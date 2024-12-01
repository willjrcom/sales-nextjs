import React, { useEffect, useState } from 'react';
import PersonForm from '../person/form';
import ButtonsModal from '../../components/modal/buttons-modal';
import Client, { ValidateClientForm } from '@/app/entities/client/client';
import DateComponent from '@/app/utils/date';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteClient from '@/app/api/client/delete/route';
import { useClients } from '@/app/context/client/context';
import NewClient from '@/app/api/client/new/route';
import UpdateClient from '@/app/api/client/update/route';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/api/error';
import AddressForm from '../address/form';
import Address from '@/app/entities/address/address';
import UpdateAddressOrderDelivery from '@/app/api/order-delivery/update/address/route';

interface ClientAddressFormProps extends CreateFormsProps<Client> {
    deliveryOrderId?: string;
}

const ClientAddressForm = ({ item, deliveryOrderId }: ClientAddressFormProps) => {
    const modalName = 'edit-client-' + item?.id;
    const modalHandler = useModal();
    const context = useClients();
    const [client, setClient] = useState<Client>(item as Client)
    const [address, setAddress] = useState<Address>(client.address)
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState<RequestError | null>(null);
    const { data } = useSession();

    useEffect(() => {
        setClient({ ...client, address: address })
    }, [address])

    const submit = async () => {
        if (!data || !deliveryOrderId) return;
        client.birthday = DateComponent(client.birthday)
        const validationErrors = ValidateClientForm(client);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);
        
        try {
            await UpdateClient(client, data);
            await UpdateAddressOrderDelivery(deliveryOrderId, data)
            setError(null);

            context.updateItem(client);
            modalHandler.hideModal(modalName);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    return (
        <>
            <AddressForm addressParent={client.address} setAddressParent={setAddress} />
            {error && <p className='text-red-500'>{error.message}</p>}
            <ErrorForms errors={errors} />
            <ButtonsModal
                isUpdate={client.id !== ""}
                onSubmit={submit}
                onCancel={() => modalHandler.hideModal(modalName)}
            />
        </>
    );
    
};

export default ClientAddressForm;