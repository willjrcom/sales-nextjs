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
import { useEmployees } from '@/app/context/employee/context';
import ModalHandler from '@/app/components/modal/modal';
import NewEmployee from '@/app/api/employee/new/route';
import UpdateEmployee from '@/app/api/employee/update/route';
import { useModal } from '@/app/context/modal/context';

const EmployeeForm = ({ item, isUpdate }: CreateFormsProps<Employee>) => {
    const modalHandler = useModal();
    const context = useEmployees();
    const [person, setPerson] = useState<Person>(item as Person || new Person())
    const { data } = useSession();
    
    const submit = async () => {
        if (!data) return;
        let employee = new Employee(person)
        employee.birthday = DateComponent(person.birthday)
        const response = isUpdate ? await UpdateEmployee(employee, data) : await NewEmployee(employee, data)

        if (response) {
            modalHandler.setShowModal(false);
        }

        if (isUpdate) {
            employee.id = response
            context.addItem(employee);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        let employee = new Employee(person)
        DeleteEmployee(employee.id, data)
        modalHandler.setShowModal(false);
        context.removeItem(employee.id)
    }

    return (
        <>
            <PersonForm person={person} onPersonChange={setPerson}/>
            <ButtonsModal isUpdate={person.id !== ''} onSubmit={submit} onDelete={onDelete} onCancel={() =>modalHandler.setShowModal(false)}/>
        </>
    );
};

export default EmployeeForm;