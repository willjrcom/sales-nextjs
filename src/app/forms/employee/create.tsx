import React, { useState } from 'react';
import CreatePersonForm from '../person/create';
import Person from '@/app/entities/person/person';

const CreateEmployeeForm = () => {
    const [person, setPerson] = useState<Person>(new Person())

    return (
        <>
            <CreatePersonForm person={person} onPersonChange={setPerson}/>
        </>
    );
};

export default CreateEmployeeForm;