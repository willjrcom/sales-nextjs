'use client';

import React, { useState } from 'react';
import PersonForm from '../person/form';
import Person from '@/app/entities/person/person';
import Employee from '@/app/entities/employee/employee';
import { useSession } from 'next-auth/react';
import ButtonsModal from '../buttons-modal';
import DateComponent from '@/app/utils/date';
import CreateFormsProps from '../create-forms-props';
import DeleteEmployee from '@/app/api/employee/delete/route';

const EmployeeForm = ({ item, handleCloseModal, onSubmit, context }: CreateFormsProps<Employee>) => {
    const [person, setPerson] = useState<Person>(item as Person || new Person())
    const { data } = useSession();
    
    const submit = async () => {
        if (!data) return;
        let employee = new Employee(person)
        employee.birthday = DateComponent(person.birthday)
        const response = await onSubmit(employee, data)

        if (response) {
            handleCloseModal();
            context.addItem(employee)
        }
    }

    const onDelete = async () => {
        if (!data) return;
        let employee = new Employee(person)
        DeleteEmployee(employee, data)
        handleCloseModal();
        context.removeItem(employee.id)
    }

    return (
        <>
            <PersonForm person={person} onPersonChange={setPerson}/>
            <ButtonsModal isUpdate={person.id !== ''} onSubmit={submit} onDelete={onDelete} onCancel={handleCloseModal}/>
        </>
    );
};

export default EmployeeForm;