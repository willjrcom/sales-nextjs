import React, { useEffect, useState } from 'react';
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
import { HiddenField, TextField } from '@/app/components/modal/field';
import User from '@/app/entities/user/user';
import NewUser from '@/app/api/user/new/route';
import SearchUser from '@/app/api/user/search/route';
import { FaCheck } from 'react-icons/fa';

interface EmployeeFormProps extends CreateFormsProps<Employee> {
    isDisabledPerson?: boolean;
}

const EmployeeForm = ({ item, isUpdate, isDisabledPerson }: EmployeeFormProps) => {
    const modalName = isUpdate ? 'edit-employee-' + item?.id : 'new-employee'
    const modalHandler = useModal();
    const [employee, setEmployee] = useState<Employee>(item || new Employee());
    const [userFound, setUserFound] = useState<User>();
    const [person, setPerson] = useState<Person>(item || new Person());
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState<RequestError | null>(null);
    const [cpfToSearch, setCpfToSearch] = useState<string>('');
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    useEffect(() => {
        setEmployee(prev => ({ ...prev, user: person as User }));
    }, [person]);

    const handleInputChange = (field: keyof Employee, value: any) => {
        setEmployee(prev => ({ ...prev, [field]: value }));
    };

    const searchUserByCpf = async () => {
        if (!data) return;

        try {
            const user = await SearchUser({cpf: cpfToSearch}, data);
            setUserFound(user);
            setError(null);
        } catch (error) {
            setUserFound(undefined);
            setError(error as RequestError);
        }
    }

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
            setError(null);
            dispatch(updateEmployee({ type: "UPDATE", payload: { id: newEmployee.id, changes: newEmployee } }));

            modalHandler.hideModal(modalName);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    const createUserAndEmployee = async () => {
        if (!data) return;
        let newEmployee: Employee = { ...employee, ...person };

        if (newEmployee.birthday) {
            newEmployee.birthday = ToIsoDate(newEmployee.birthday)
        }

        const validationErrors = ValidateEmployeeForm(newEmployee);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const responseUser = await NewUser(newEmployee, "", true)
            const responseEmployee = await NewEmployee(responseUser, data)
            setError(null);

            newEmployee.id = responseEmployee
            dispatch(addEmployee(newEmployee));

            modalHandler.hideModal(modalName);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteEmployee(employee.id, data);
        dispatch(removeEmployee(employee.id));
        modalHandler.hideModal(modalName);
    }

    const classTotalColumns = isUpdate ? "grid-cols-1" : "grid-cols-3";
    return (
        <>
            {error && <p className="text-red-500">{error.message}</p>}

            <div className={"grid " + classTotalColumns + " gap-4 items-start w-full max-w-7xl mx-auto"}>
                {/* Coluna da Esquerda: Buscar por CPF */}
                {!isUpdate && <div className="flex justify-center items-center shadow-md h-[80vh] min-w-[20vw]">
                    <div className="w-full block rounded-md p-8">
                        <TextField
                            name="cpf"
                            friendlyName="Buscar por CPF"
                            placeholder="Digite o CPF"
                            setValue={setCpfToSearch}
                            value={cpfToSearch}
                        />

                        {/* Botões de Ação */}
                        <div className="mt-6">
                            <ButtonsModal
                                item={employee}
                                name="Funcionário"
                                onSubmit={searchUserByCpf}
                            />
                        </div>

                        <CardUser user={userFound} />
                    </div>

                </div>}

                {!isUpdate && <div className="flex justify-center items-center h-[80vh]">
                    <p className="text-center text-gray-500">ou</p>
                </div>}

                {/* Coluna da Direita: Formulário de Funcionário */}
                <div className="w-full min-w-[30vw] bg-white shadow-md rounded-md p-8">
                    <PersonForm person={person} setPerson={setPerson} isEmployee isHidden={isDisabledPerson} />

                    <HiddenField
                        name="user_id"
                        setValue={(value) => handleInputChange("user_id", value)}
                        value={employee.user_id}
                    />
                    <ErrorForms errors={errors} />

                    {/* Botões de Ação */}
                    <div className="mt-6">
                        <ButtonsModal
                            item={employee}
                            name="Funcionário"
                            onSubmit={submitEmployee}
                            deleteItem={onDelete}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};


interface CardUserProps {
    user: User | undefined;
}

const CardUser = ({ user }: CardUserProps) => {
    const [error, setError] = useState<RequestError | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    const newEmployee = async (user: User) => {
        if (!data) return;

        const employee = new Employee(undefined, user.id, user);
        try {
            const response = await NewEmployee(user.id, data);

            employee.id = response
            dispatch(addEmployee(employee));

            setError(null);
        } catch (error) {
            setError(error as RequestError);

            setInterval(() => {
                setError(null);
            }, 5000);
        }
    }

    if (!user) return;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4 max-w-lg mx-auto">
            <h2 className="text-xl font-semibold text-gray-700">Usuário encontrado</h2>
            <div className="space-y-2">
                <p className="text-gray-600">Nome: <span className="font-semibold">{user.name}</span></p>
                <p className="text-gray-600">Endereço: {user.address.street}, {user.address.number}</p>
                <p className="text-gray-600">Bairro: {user.address.neighborhood}</p>
                <p className="text-gray-600">Cidade: {user.address.city}</p>
                <p className="text-gray-600">CEP: {user.address.cep}</p>
            </div>

            <div className="space-y-2">
                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">({user.contact.ddd}) {user.contact.number}</span>
                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">{user.cpf}</span>
            </div>

            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <button
                onClick={() => newEmployee(user)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
                <FaCheck />
                <span>Cadastrar funcionário</span>
            </button>
        </div>
    );
}

export default EmployeeForm;