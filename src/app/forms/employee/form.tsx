import React, { useState } from 'react';
import PersonForm from '../person/form';
import Person from '@/app/entities/person/person';
import Employee, { ValidateEmployeeForm } from '@/app/entities/employee/employee';
import { useSession } from 'next-auth/react';
import ButtonsModal from '../../components/modal/buttons-modal';
import CreateFormsProps from '../create-forms-props';
import DeleteEmployee from '@/app/api/employee/delete/route';
import NewEmployee from '@/app/api/employee/new/route';
import UpdateEmployee from '@/app/api/employee/update/route';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/api/error';
import { ToIsoDate } from '@/app/utils/date';
import { addEmployee, removeEmployee, updateEmployee } from '@/redux/slices/employees';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';

const EmployeeForm = ({ item, isUpdate }: CreateFormsProps<Employee>) => {
    const modalName = isUpdate ? 'edit-employee-' + item?.id : 'new-employee'
    const modalHandler = useModal();
    const [person, setPerson] = useState<Person>(item || new Employee());
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState<RequestError | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    const submit = async () => {
        if (!data) return;
        let employee = new Employee(person)

        if (employee.birthday) {
            employee.birthday = ToIsoDate(employee.birthday)
        }

        const validationErrors = ValidateEmployeeForm(employee);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const response = isUpdate ? await UpdateEmployee(employee, data) : await NewEmployee(employee, data)
            setError(null);

            if (!isUpdate) {
                employee.id = response
                dispatch(addEmployee(employee));
            } else {
                dispatch(updateEmployee(employee));
            }

            modalHandler.hideModal(modalName);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        let employee = new Employee(person);
        DeleteEmployee(employee.id, data);
        dispatch(removeEmployee(employee));
        modalHandler.hideModal(modalName);
    }

    return (
        <>
            {error && <p className='text-red-500'>{error.message}</p>}
            <PersonForm person={person} setPerson={setPerson} />
            <ErrorForms errors={errors} />
            <ButtonsModal item={person} name="Funcionário" onSubmit={submit} deleteItem={onDelete} />
        </>
    );
};

export default EmployeeForm;