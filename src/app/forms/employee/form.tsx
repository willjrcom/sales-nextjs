import React, { useState } from 'react';
import CreatePersonForm from '../person/create';
import Person from '@/app/entities/person/person';
import Employee from '@/app/entities/employee/employee';
import { useSession } from 'next-auth/react';
import ButtonModal from '../buttons-modal';
import DateComponent from '@/app/utils/date';
import CreateFormsProps from '../create-forms-props';

const EmployeeForm = ({ item, handleCloseModal, reloadData, onSubmit }: CreateFormsProps<Employee>) => {
    const [person, setPerson] = useState<Person>(item as Person || new Person())
    const { data } = useSession();

    const submit = async () => {
        if (!data) return;
        let employee = new Employee(person)
        employee.birthday = DateComponent(person.birthday)
        const response = await onSubmit(employee, data)

        if (response) {
            handleCloseModal();
            reloadData();
        }
    }

    return (
        <>
            <CreatePersonForm person={person} onPersonChange={setPerson} likeTax={false}/>
            <ButtonModal isUpdate={person.id !== ''} onSubmit={submit} onCancel={handleCloseModal}/>
        </>
    );
};

export default EmployeeForm;