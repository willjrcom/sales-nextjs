import React, { useState } from 'react';
import CreatePersonForm from '../person/create';
import Person from '@/app/entities/person/person';
import NewEmployee from '@/app/api/employee/new/route';
import { Employee } from '@/app/entities/employee/employee';
import { useSession } from 'next-auth/react';
import ButtonModal from '../buttons-modal';
import DateComponent from '@/app/utils/date';

const CreateEmployeeForm = ({ handleCloseModal, reloadData }: CreateFormsProps) => {
    const [person, setPerson] = useState<Person>(new Person())
    const { data } = useSession();

    const submit = async () => {
        if (!data) return;
        let employee = new Employee(person)
        employee.birthday = DateComponent(person.birthday)
        const response = await NewEmployee(employee, data)

        if (response) {
            handleCloseModal();
            reloadData();
        }
    }

    return (
        <>
            <CreatePersonForm person={person} onPersonChange={setPerson}/>
            <ButtonModal onSubmit={submit} onCancel={handleCloseModal}/>
        </>
    );
};

export default CreateEmployeeForm;