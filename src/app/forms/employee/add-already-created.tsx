import NewEmployee from "@/app/api/employee/new/employee";
import SearchUser from "@/app/api/user/search/user";
import PatternField from "@/app/components/modal/fields/pattern";
import { useModal } from "@/app/context/modal/context";
import Employee from "@/app/entities/employee/employee";
import User from "@/app/entities/user/user";
import RequestError from "@/app/utils/error";
import { notifyError } from "@/app/utils/notifications";
import { addEmployee } from "@/redux/slices/employees";
import { AppDispatch } from "@/redux/store";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { useDispatch } from "react-redux";

const AddEmployeeAlreadyCreated = () => {
    const [userFound, setUserFound] = useState<User>();
    const [cpfToSearch, setCpfToSearch] = useState<string>('');
    const { data } = useSession();

    const searchUserByCpf = async () => {
        if (!data) return;

        try {
            const user = await SearchUser({ cpf: cpfToSearch }, data);
            setUserFound(user);
        } catch (error) {
            setUserFound(undefined);
            const err = error as RequestError;
            notifyError(err.message);
        }
    }

    return (
        <div className="shadow-md bg-white rounded-lg p-6 mb-6">
            <div className="space-y-4">
                <div>
                    <label htmlFor="cpf-search" className="block text-sm font-medium text-gray-700">
                        Buscar por CPF
                    </label>
                    <div className="mt-1 flex">
                        <PatternField
                            name="cpf-search"
                            placeholder="000.000.000-00"
                            patternName="cpf"
                            setValue={setCpfToSearch}
                            value={cpfToSearch}
                            formatted={true}
                            optional
                        />
                        <button
                            type="button"
                            onClick={searchUserByCpf}
                            className="ml-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center"
                        >
                            <FaCheck className="mr-2" />Buscar
                        </button>
                    </div>
                </div>
                {userFound && (
                    <div>
                        <CardUser user={userFound} />
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

        const employee = new Employee(undefined, user.id, user);
        try {
            const response = await NewEmployee(user.id, data);

            employee.id = response
            dispatch(addEmployee(employee));

            modalHandler.hideModal('new-already-created-employee');
            
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Erro ao criar funcionário');
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

export default AddEmployeeAlreadyCreated