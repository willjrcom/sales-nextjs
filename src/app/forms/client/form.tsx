import React, { useState } from 'react';
import PersonForm from '../person/form';
import ButtonsModal from '../buttons-modal';
import Client, { SchemaClient } from '@/app/entities/client/client';
import DateComponent from '@/app/utils/date';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteClient from '@/app/api/client/delete/route';
import { useClients } from '@/app/context/client/context';
import NewClient from '@/app/api/client/new/route';
import UpdateClient from '@/app/api/client/update/route';
import { useModal } from '@/app/context/modal/context';

const ClientForm = ({ item, isUpdate }: CreateFormsProps<Client>) => {
    const modalName = isUpdate ? 'edit-client' : 'new-client'
    const modalHandler = useModal();
    const context = useClients();
    const [client, setPerson] = useState<Client>(item || new Client())
    const [error, setError] = useState<Record<string, string[]>>({});
    const { data } = useSession();

    const submit = async () => {
        if (!data) return;
        client.birthday = DateComponent(client.birthday)
        validate(client, setError)
        if (Object.values(error).length > 0) return;

        try {
            const response = isUpdate ? await UpdateClient(client, data) : await NewClient(client, data)
            
            if (!isUpdate) {
                client.id = response
                context.addItem(client);
            } else {
                context.updateItem(client);
            }
            
            modalHandler.hideModal(modalName);
        } catch (error) {}
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteClient(client.id, data)
        context.removeItem(client.id)
        modalHandler.hideModal(modalName)
    }

    return (
        <>
            {Object.entries(error).map(([field, messages]) =>
                messages.map((message, index) => (
                    <p key={`${field}-${index}`} className="text-red-500">
                        {message}
                    </p>
                ))
            )}
            <PersonForm person={client} onPersonChange={setPerson} />
            <ButtonsModal
                isUpdate={client.id !== ""}
                onSubmit={submit}
                onDelete={onDelete}
                onCancel={() => modalHandler.hideModal(modalName)}
            />
        </>
    );
    
};


const validate = (client: Client, setError: React.Dispatch<React.SetStateAction<Record<string, string[]>>>) => {
    const validatedFields = SchemaClient.safeParse({
        name: client.name,
        email: client.email,
        cpf: client.cpf,
        birthday: client.birthday,
        contact: client.contact,
    });

    if (!validatedFields.success) {
        // Usa o método flatten para simplificar os erros
        const fieldErrors = validatedFields.error.flatten().fieldErrors;
        setError(fieldErrors); // Atualiza o estado com os erros
    } else {
        setError({}); // Limpa os erros caso todos os campos estejam válidos
    }
};

export default ClientForm;