import React, { useState } from 'react';
import PersonForm from '../person/form';
import ButtonsModal from '../../components/modal/buttons-modal';
import Client, { ValidateClientForm } from '@/app/entities/client/client';
import { ToIsoDate } from '@/app/utils/date';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteClient from '@/app/api/client/delete/route';
import { useClients } from '@/app/context/client/context';
import NewClient from '@/app/api/client/new/route';
import UpdateClient from '@/app/api/client/update/route';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/api/error';

const ClientForm = ({ item, isUpdate }: CreateFormsProps<Client>) => {
    const modalName = isUpdate ? 'edit-client-' + item?.id : 'new-client'
    const modalHandler = useModal();
    const context = useClients();
    const [client, setClient] = useState<Client>(item as Client || new Client())
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState<RequestError | null>(null);
    const { data } = useSession();
    
    const submit = async () => {
        if (!data) return;
        
        const newClient = new Client(client)
        
        if (newClient.birthday) {
            newClient.birthday = ToIsoDate(newClient.birthday)
        }
        
        const validationErrors = ValidateClientForm(newClient);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);
        
        try {
            const response = isUpdate ? await UpdateClient(newClient, data) : await NewClient(newClient, data)
            setError(null);

            if (!isUpdate) {
                newClient.id = response
                context.addItem(newClient);
            } else {
                context.updateItem(newClient);
            }
            
            modalHandler.hideModal(modalName);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteClient(client.id, data)
        context.removeItem(client.id)
        modalHandler.hideModal(modalName)
    }

    return (
        <>
            <PersonForm person={client} setPerson={setClient} />
            {error && <p className='text-red-500'>{error.message}</p>}
            <ErrorForms errors={errors} />
            <ButtonsModal
                item={client}
                name="Cliente"
                onSubmit={submit}
                deleteItem={onDelete}
            />
        </>
    );
    
};

export default ClientForm;