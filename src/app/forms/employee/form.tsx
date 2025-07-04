import React, { useEffect, useState } from 'react';
import PersonForm from '../person/form';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import Person from '@/app/entities/person/person';
import Employee, { ValidateEmployeeForm } from '@/app/entities/employee/employee';
import { useSession } from 'next-auth/react';
import ButtonsModal from '../../components/modal/buttons-modal';
import CreateFormsProps from '../create-forms-props';
import NewEmployee from '@/app/api/employee/new/employee';
import UpdateEmployee from '@/app/api/employee/update/employee';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { ToIsoDate } from '@/app/utils/date';
import { addEmployee, updateEmployee } from '@/redux/slices/employees';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { HiddenField } from '@/app/components/modal/field';
import User from '@/app/entities/user/user';
import NewUser from '@/app/api/user/new/user';
import AddUserToCompany from '@/app/api/company/add/company';

interface EmployeeFormProps extends CreateFormsProps<Employee> {
    isDisabledPerson?: boolean;
}

const EmployeeForm = ({ item, isUpdate, isDisabledPerson }: EmployeeFormProps) => {
    const modalName = isUpdate ? 'edit-employee-' + item?.id : 'new-employee'
    const modalHandler = useModal();
    const [employee, setEmployee] = useState<Employee>(item || new Employee());
    const [person, setPerson] = useState<Person>(item || new Person());
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    useEffect(() => {
        setEmployee(prev => ({ ...prev, user: person as User }));
    }, [person]);

    const handleInputChange = (field: keyof Employee, value: any) => {
        setEmployee(prev => ({ ...prev, [field]: value }));
    };


    const submitEmployee = async () => {
        if (isUpdate) {
            updateUserEmployee()
        } else {
            createUserAndEmployee()
        }
    }

    const updateUserEmployee = async () => {
        if (!data) return;
        let newEmployee: Employee = { ...employee, ...person };

        if (newEmployee.birthday) {
            newEmployee.birthday = ToIsoDate(newEmployee.birthday)
        }

        const validationErrors = ValidateEmployeeForm(newEmployee);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            await UpdateEmployee(newEmployee, data)
            dispatch(updateEmployee({ type: "UPDATE", payload: { id: newEmployee.id, changes: newEmployee } }));
            notifySuccess(`Funcionário ${employee.name} atualizado com sucesso`);

            modalHandler.hideModal(modalName);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao atualizar funcionário');
        }
    }

    const createUserAndEmployee = async () => {
        if (!data) return;
        let newEmployee: Employee = { ...employee, ...person };

        if (newEmployee.birthday) {
            newEmployee.birthday = ToIsoDate(newEmployee.birthday)
        }

        const validationErrors = ValidateEmployeeForm(newEmployee);
        if (Object.values(validationErrors).length > 0) return notifyError(validationErrors.toString());

        try {
            const responseUser = await NewUser(newEmployee, "", true)
            await AddUserToCompany(newEmployee.email, data)
            const responseEmployee = await NewEmployee(responseUser, data)

            newEmployee.id = responseEmployee
            dispatch(addEmployee(newEmployee));
            notifySuccess(`Funcionário ${employee.name} criado com sucesso`);

            modalHandler.hideModal(modalName);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || `Erro ao criar funcionário ${employee.name}`);
        }
    }

    return (
        <div className="w-full min-w-[30vw] bg-white shadow-md rounded-md p-8">
            <PersonForm person={person} setPerson={setPerson} isEmployee isHidden={isDisabledPerson} />

            <HiddenField
                name="user_id"
                setValue={(value) => handleInputChange("user_id", value)}
                value={employee.user_id}
            />
            <ErrorForms errors={errors} setErrors={setErrors} />

            {/* Botões de Ação */}
            <div className="mt-6">
                <ButtonsModal
                    item={employee}
                    name="Funcionário"
                    onSubmit={submitEmployee}
                />
            </div>
        </div>
    );
};


export default EmployeeForm;