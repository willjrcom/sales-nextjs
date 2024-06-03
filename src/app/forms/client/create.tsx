import React, { useEffect, useState } from 'react';
import CreatePersonForm from '../person/create';
import Person from '@/app/entities/person/person';

const CreateClientForm = () => {
    const [person, setPerson] = useState<Person>(new Person())

    return (
        <>
            <CreatePersonForm person={person} onPersonChange={setPerson}/>
            <a onClick={() => console.log(person.name, person.address)}>Criar</a>
        </>
    );
};

export default CreateClientForm;