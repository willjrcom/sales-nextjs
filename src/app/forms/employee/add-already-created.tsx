import NewEmployee from "@/app/api/employee/new/employee";
import SearchUser from "@/app/api/user/search/user";
import PatternField from "@/app/components/modal/fields/pattern";
import { useModal } from "@/app/context/modal/context";
import Employee from "@/app/entities/employee/employee";
import User from "@/app/entities/user/user";
import Person from "@/app/entities/person/person";
import RequestError from "@/app/utils/error";
import { notifyError } from "@/app/utils/notifications";
import { addEmployee } from "@/redux/slices/employees";
import { AppDispatch } from "@/redux/store";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { FaCheck, FaSearch, FaUserPlus, FaExclamationCircle } from "react-icons/fa";
import { useDispatch } from "react-redux";
import EmployeeForm from "@/app/forms/employee/form";
import AddUserToCompany from "@/app/api/company/add/company";

const AddEmployeeAlreadyCreated = () => {
    const [userFound, setUserFound] = useState<User | null>();
    const [cpfToSearch, setCpfToSearch] = useState<string>('');
    const [notFound, setNotFound] = useState<boolean>(false);
    const { data } = useSession();

    const searchUserByCpf = async () => {
        if (!data) return;
        setNotFound(false);
        try {
            const user = await SearchUser({ cpf: cpfToSearch }, data);
            setUserFound(user);
        } catch (error) {
            setUserFound(null);
            setNotFound(true);
        }
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 mx-auto flex flex-col gap-6">
            <div className="flex flex-col gap-4">
                <div className="max-w-md mx-auto">
                    <label htmlFor="cpf-search" className="block text-base font-semibold text-gray-700 mb-2">
                        Buscar funcionário por CPF
                    </label>
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <PatternField
                                name="cpf-search"
                                placeholder="000.000.000-00"
                                patternName="cpf"
                                setValue={setCpfToSearch}
                                value={cpfToSearch}
                                formatted={true}
                                optional
                            />
                        </div>
                        <button
                            type="button"
                            onClick={searchUserByCpf}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                            title="Buscar CPF"
                        >
                            <FaSearch />
                            Buscar
                        </button>
                    </div>
                </div>
                {userFound && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-4 shadow flex flex-col gap-3">
                        <div className="flex items-center gap-2 mb-2">
                            <FaCheck className="text-green-600" />
                            <span className="text-green-700 font-semibold">Usuário encontrado</span>
                        </div>
                        <CardUser user={userFound} />
                    </div>
                )}
                {notFound && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-4 shadow flex flex-col gap-3 max-w-2xl mx-auto">
                        <div className="flex items-center gap-2 mb-2">
                            <FaExclamationCircle className="text-yellow-600" />
                            <span className="text-yellow-700 font-semibold">Usuário não encontrado. Cadastre um novo funcionário:</span>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-lg p-4">
                            <EmployeeForm item={new Employee({ cpf: cpfToSearch })} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface CardUserProps {
    user: User | undefined;
}

const CardUser = ({ user }: CardUserProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();
    const modalHandler = useModal();

    const newEmployee = async (user: User) => {
        if (!data) return;

        const employee = new Employee({ user_id: user.id, ...user });
        
        try {
            await AddUserToCompany(user.email, data)
            const response = await NewEmployee(user.id, data);

            employee.id = response
            dispatch(addEmployee(employee));

            modalHandler.hideModal('new-already-created-employee');

        } catch (error: RequestError | any) {
            if (error.message == 'user already added to company' || error.message == 'Usuário já foi adicionado à empresa') {
                const response = await NewEmployee(user.id, data);
    
                employee.id = response
                dispatch(addEmployee(employee));
    
                modalHandler.hideModal('new-already-created-employee');
                return;
            }

            notifyError(error.message || 'Erro ao criar funcionário');
        }
    }

    if (!user) return null;

    return (
        <div className="flex flex-col gap-2">
            <div className="text-gray-700 text-lg font-semibold flex items-center gap-2">
                <FaUserPlus className="text-blue-500" />
                {user.name}
            </div>
            <div className="text-gray-600 text-sm">E-mail: <span className="font-medium">{user.email}</span></div>
            <div className="text-gray-600 text-sm">CPF: <span className="font-medium">{user.cpf}</span></div>
            <div className="text-gray-600 text-sm">Endereço: <span className="font-medium">{user.address.street}, {user.address.number}</span></div>
            <div className="text-gray-600 text-sm">Bairro: <span className="font-medium">{user.address.neighborhood}</span></div>
            <div className="text-gray-600 text-sm">Cidade: <span className="font-medium">{user.address.city}</span></div>
            <div className="text-gray-600 text-sm">CEP: <span className="font-medium">{user.address.cep}</span></div>
            <div className="flex gap-2 mt-2">
                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">({user.contact.ddd}) {user.contact.number}</span>
                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">{user.cpf}</span>
            </div>
            <button
                onClick={() => newEmployee(user)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 mt-4 font-semibold shadow"
            >
                <FaCheck />
                <span>Cadastrar funcionário</span>
            </button>
        </div>
    );
}

export default AddEmployeeAlreadyCreated;