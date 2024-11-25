import React, { useState } from 'react';
import PersonForm from '../person/form';
import Person from '@/app/entities/person/person';
import Employee, { ValidateEmployeeForm } from '@/app/entities/employee/employee';
import { useSession } from 'next-auth/react';
import ButtonsModal from '../buttons-modal';
import DateComponent from '@/app/utils/date';
import CreateFormsProps from '../create-forms-props';
import DeleteEmployee from '@/app/api/employee/delete/route';
import { useEmployees } from '@/app/context/employee/context';
import NewEmployee from '@/app/api/employee/new/route';
import UpdateEmployee from '@/app/api/employee/update/route';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../error-forms';

const EmployeeForm = ({ item, isUpdate }: CreateFormsProps<Employee>) => {
    const modalName = isUpdate ? 'edit-employee' : 'new-employee'
    const modalHandler = useModal();
    const context = useEmployees();
    const [person, setPerson] = useState<Person>(item || new Person())
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const { data } = useSession();
    
    const submit = async () => {
        if (!data) return;
        let employee = new Employee(person)
        employee.birthday = DateComponent(person.birthday)

        const validationErrors = ValidateEmployeeForm(employee);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        const response = isUpdate ? await UpdateEmployee(employee, data) : await NewEmployee(employee, data)

        if (!isUpdate) {
            employee.id = response
            context.addItem(employee);
        } else {
            context.updateItem(employee);
        }
        
        modalHandler.hideModal(modalName);
    }

    const onDelete = async () => {
        if (!data) return;
        let employee = new Employee(person)
        DeleteEmployee(employee.id, data)
        context.removeItem(employee.id)
        modalHandler.hideModal(modalName);
    }

    return (
        <>
            <PersonForm person={person} onPersonChange={setPerson}/>
            <ErrorForms errors={errors} />
            <ButtonsModal isUpdate={person.id !== ''} onSubmit={submit} onDelete={onDelete} onCancel={() => modalHandler.hideModal(modalName)}/>
        </>
    );
};

export default EmployeeForm;