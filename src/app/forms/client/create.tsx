import React, { useEffect, useState } from 'react';
import CreatePersonForm from '../person/create';
import Person from '@/app/entities/person/person';
import ButtonModal from '../buttons-modal';
import Client from '@/app/entities/client/client';
import DateComponent from '@/app/utils/date';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';


const ClientForm = ({ item, handleCloseModal, reloadData, onSubmit }: CreateFormsProps<Client>) => {
    const [person, setPerson] = useState<Person>(item as Person || new Person())
    const { data } = useSession();

    const submit = async () => {
        if (!data) return;
        let client = new Client(person)
        client.birthday = DateComponent(person.birthday)
        const response = await onSubmit(client, data)

        if (response) {
            handleCloseModal()
            reloadData()
        }
    }
    
    return (
        <>
            <CreatePersonForm person={person} onPersonChange={setPerson}/>
            <ButtonModal isUpdate={person.id !== ''} onSubmit={submit} onCancel={handleCloseModal}/>
        </>
    );
};

export default ClientForm;