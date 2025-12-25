import React, { useCallback, useEffect, useState } from 'react';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
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
import { DateField, HiddenField, ImageField, TextField } from '@/app/components/modal/field';
import NewUser from '@/app/api/user/new/user';
import AddUserToCompany from '@/app/api/company/add/company';
import { useQueryClient } from '@tanstack/react-query';
import PatternField from '@/app/components/modal/fields/pattern';
import AddressForm from '../address/form';
import ContactForm from '../contact/form';
import Contact from '@/app/entities/contact/contact';
import Address from '@/app/entities/address/address';

interface EmployeeFormProps extends CreateFormsProps<Employee> {
    isDisabledPerson?: boolean;
}

const EmployeeForm = ({ item, isUpdate, isDisabledPerson }: EmployeeFormProps) => {
    const modalName = 'new-already-created-employee'
    const modalHandler = useModal();
    const [employee, setEmployee] = useState<Employee>(item || new Employee());
    const [contact, setContact] = useState<Contact>(employee.contact || new Contact())
    const [address, setAddress] = useState<Address>(employee.address || new Address())
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const queryClient = useQueryClient();
    const { data } = useSession();

    const handleInputChange = useCallback((field: keyof Employee, value: any) => {
        setEmployee(prev => ({
            ...prev,
            [field]: value
        } as Employee));
    }, [setEmployee]);

    useEffect(() => {
        handleInputChange('address', address);
    }, [address]);

    useEffect(() => {
        handleInputChange('contact', contact);
    }, [contact]);

    const submitEmployee = async () => {
        if (isUpdate) {
            updateUserEmployee()
        } else {
            createUserAndEmployee()
        }
    }

    const updateUserEmployee = async () => {
        if (!data) return;
        const newEmployee = new Employee();
        Object.assign(newEmployee, { ...employee });

        if (newEmployee.birthday) {
            newEmployee.birthday = ToIsoDate(newEmployee.birthday)
        } else {
            // Remove o campo birthday se estiver vazio, pois o backend usa ponteiro
            delete newEmployee.birthday;
        }

        const validationErrors = ValidateEmployeeForm(newEmployee);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            await UpdateEmployee(newEmployee, data)
            notifySuccess(`Funcionário ${employee.name} atualizado com sucesso`);

            modalHandler.hideModal(modalName);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao atualizar funcionário');
        }
    }

    const createUserAndEmployee = async () => {
        if (!data) return;
        const newEmployee = new Employee();
        Object.assign(newEmployee, { ...employee });

        if (newEmployee.birthday) {
            newEmployee.birthday = ToIsoDate(newEmployee.birthday)
        }

        const validationErrors = ValidateEmployeeForm(newEmployee);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const responseUser = await NewUser(newEmployee, "", true)
            await AddUserToCompany(newEmployee.email, data)
            const responseEmployee = await NewEmployee(responseUser, data)

            newEmployee.id = responseEmployee
            notifySuccess(`Funcionário ${employee.name} criado com sucesso`);

            modalHandler.hideModal(modalName);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || `Erro ao criar funcionário ${employee.name}`);
        }
    }

    return (
        <div className="text-black space-y-6">
            {/* Seção: Informações Básicas */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações Básicas</h3>
                <TextField name="name" friendlyName="Nome" placeholder="Digite seu nome" setValue={value => handleInputChange('name', value)} value={employee.name} disabled={isDisabledPerson} />
            </div>

            {/* Seção: Contato */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-blue-200">Contato</h3>
                <ContactForm contactParent={contact} setContactParent={setContact} isHidden={isDisabledPerson} />
            </div>

            {/* Seção: Endereço */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">Endereço</h3>
                <AddressForm addressParent={employee.address} setAddressParent={setAddress} isHidden={isDisabledPerson} />
            </div>

            {/* Seção: Dados Adicionais */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg shadow-sm border border-purple-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">Dados Adicionais</h3>
                <div className="space-y-4">

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField name="email" friendlyName="Email" placeholder="Digite seu e-mail" setValue={value => handleInputChange('email', value)} value={employee.email} optional={false} disabled={isDisabledPerson} />

                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <ImageField
                                friendlyName='Imagem'
                                name='image_path'
                                setValue={value => handleInputChange('image_path', value)}
                                value={employee.image_path}
                                optional
                                onUploadError={(error) => notifyError(error)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <PatternField patternName="cpf" name="cpf" friendlyName="CPF" placeholder="Digite seu cpf" setValue={value => handleInputChange('cpf', value)} value={employee.cpf || ''} optional={false} disabled={isDisabledPerson} formatted={true} />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <DateField name="birthday" friendlyName="Nascimento" setValue={value => handleInputChange('birthday', value)} value={employee.birthday} optional={false} disabled={isDisabledPerson} />
                        </div>
                    </div>
                </div>
            </div>

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