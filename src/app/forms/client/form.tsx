'use client';

import React, { useState } from 'react';
import PersonForm from '../person/form';
import Person from '@/app/entities/person/person';
import ButtonsModal from '../buttons-modal';
import Client from '@/app/entities/client/client';
import DateComponent from '@/app/utils/date';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteClient from '@/app/api/client/delete/route';
import { useRouter } from 'next/router';


const ClientForm = ({ item, handleCloseModal, onSubmit, context }: CreateFormsProps<Client>) => {
    const [person, setPerson] = useState<Person>(item as Person || new Person())
    const { data } = useSession();

    const submit = async () => {
        if (!data) return;
        let client = new Client(person)
        client.birthday = DateComponent(person.birthday)
        const response = await onSubmit(client, data)

        if (response) {
            handleCloseModal()
            context.addItem(client)
        }
    }
    
    const onDelete = async () => {
        if (!data) return;
        let client = new Client(person)
        DeleteClient(client.id, data)
        handleCloseModal();
        context.removeItem(client.id)
    }

    return (
        <>
            <PersonForm person={person} onPersonChange={setPerson}/>
            <ButtonsModal isUpdate={person.id !== ''} onSubmit={submit} onDelete={onDelete} onCancel={handleCloseModal}/>
        </>
    );
};

export default ClientForm;