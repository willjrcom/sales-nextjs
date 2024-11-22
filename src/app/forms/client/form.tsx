'use client';

import React, { useState } from 'react';
import PersonForm from '../person/form';
import ButtonsModal from '../buttons-modal';
import Client from '@/app/entities/client/client';
import DateComponent from '@/app/utils/date';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteClient from '@/app/api/client/delete/route';
import { useClients } from '@/app/context/client/context';
import ModalHandler from '@/app/components/modal/modal';


const ClientForm = ({ item, onSubmit }: CreateFormsProps<Client>) => {
    const modalHandler = ModalHandler();
    const context = useClients();
    const [person, setPerson] = useState<Client>(item as Client || new Client())
    const { data } = useSession();

    const submit = async () => {
        if (!data) return;
        let client = new Client(person)
        client.birthday = DateComponent(person.birthday)
        const response = await onSubmit(client, data)

        if (response) {
            modalHandler.setShowModal(false)
            context.addItem(client)
        }
    }
    
    const onDelete = async () => {
        if (!data) return;
        let client = new Client(person)
        DeleteClient(client.id, data)
        modalHandler.setShowModal(false)
        context.removeItem(client.id)
    }

    return (
        <>
            <PersonForm person={person} onPersonChange={setPerson}/>
            <ButtonsModal isUpdate={person.id !== ''} onSubmit={submit} onDelete={onDelete} onCancel={() =>
            modalHandler.setShowModal(false)}/>
        </>
    );
};

export default ClientForm;