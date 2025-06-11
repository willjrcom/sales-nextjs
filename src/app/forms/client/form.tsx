import React, { useState } from 'react';
import PersonForm from '../person/form';
import ButtonsModal from '../../components/modal/buttons-modal';
import Client, { ValidateClientForm } from '@/app/entities/client/client';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { ToIsoDate } from '@/app/utils/date';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteClient from '@/app/api/client/delete/client';
import NewClient from '@/app/api/client/new/client';
import UpdateClient from '@/app/api/client/update/client';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { addClient, removeClient, updateClient } from '@/redux/slices/clients';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import Person from '@/app/entities/person/person';

const ClientForm = ({ item, isUpdate }: CreateFormsProps<Client>) => {
    const modalName = isUpdate ? 'edit-client-' + item?.id : 'new-client'
    const modalHandler = useModal();
    const [client, setClient] = useState<Client>(item as Client || new Client())
    const [person, setPerson] = useState<Person>(client as Person);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();
    
    const submit = async () => {
        if (!data) return;
        
        const newClient = { ...client, ...person };
        
        if (newClient.birthday) {
            newClient.birthday = ToIsoDate(newClient.birthday)
        }
        
        const validationErrors = ValidateClientForm(newClient);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);
        
        try {
            const response = isUpdate ? await UpdateClient(newClient, data) : await NewClient(newClient, data)
            
            if (!isUpdate) {
                newClient.id = response
                dispatch(addClient({...newClient}));
                notifySuccess(`Cliente ${client.name} criado com sucesso`);
            } else {
                dispatch(updateClient({ type: "UPDATE", payload: {id: newClient.id, changes: newClient}}));
                notifySuccess(`Cliente ${client.name} atualizado com sucesso`);
            }
            
            modalHandler.hideModal(modalName);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao salvar cliente');
        }
    }

    const onDelete = async () => {
        if (!data) return;

        try {
            await DeleteClient(client.id, data);
            dispatch(removeClient(client.id));
            notifySuccess(`Cliente ${client.name} removido com sucesso`);
            modalHandler.hideModal(modalName)
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || `Erro ao remover cliente ${client.name}`);
        }
    }

    return (
        <>
            <PersonForm person={person} setPerson={setPerson} />
            <ErrorForms errors={errors} setErrors={setErrors} />
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