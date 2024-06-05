import React, { useEffect, useState } from 'react';
import CreatePersonForm from '../person/create';
import Person from '@/app/entities/person/person';
import ButtonModal from '../buttons-modal';
import { Client } from '@/app/entities/client/client';
import DateComponent from '@/app/utils/date';
import { useSession } from 'next-auth/react';
import NewClient from '@/app/api/client/new/route';


const CreateClientForm = ({ handleCloseModal, reloadData }: CreateFormsProps) => {
    const [person, setPerson] = useState<Person>(new Person())
    const { data } = useSession();

    const submit = async () => {
        if (!data) return;
        let client = new Client(person)
        client.birthday = DateComponent(person.birthday)
        const response = await NewClient(client, data)

        if (response) {
            handleCloseModal()
            reloadData()
        }
    }
    return (
        <>
            <CreatePersonForm person={person} onPersonChange={setPerson}/>
            <ButtonModal onSubmit={submit} onCancel={handleCloseModal}/>
        </>
    );
};

export default CreateClientForm;