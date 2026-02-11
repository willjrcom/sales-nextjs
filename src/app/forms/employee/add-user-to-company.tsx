import NewEmployee from "@/app/api/employee/new/employee";
import SearchUser from "@/app/api/user/search/user";
import PatternField from "@/app/components/modal/fields/pattern";
import { useModal } from "@/app/context/modal/context";
import Employee from "@/app/entities/employee/employee";
import User from "@/app/entities/user/user";
import RequestError from "@/app/utils/error";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { FaCheck, FaSearch, FaUserPlus, FaExclamationCircle } from "react-icons/fa";
import CreateAndAddUserToCompanyForm from "@/app/forms/employee/create-and-add-user-to-company";
import AddUserToCompany from "@/app/api/company/add/company";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const AddUserToCompanyForm = () => {
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
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-8 mx-auto flex flex-col gap-6 w-full max-w-4xl transition-all hover:shadow-xl">
            {/* Search Header */}
            {!userFound && !notFound && (
                <div className="text-center space-y-2 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Novo Funcionário</h2>
                    <p className="text-gray-500">Busque por CPF para adicionar um funcionário existente ou cadastrar um novo.</p>
                </div>
            )}

            {/* Search Box */}
            <div className="max-w-xl mx-auto w-full">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
                    <label htmlFor="cpf-search" className="block text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                        Buscar por CPF
                    </label>
                    <div className="flex gap-3 [&>div]:mb-0 [&>div]:flex-1">
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
                            className="h-[42px] px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Buscar CPF"
                            disabled={!cpfToSearch || cpfToSearch.length < 14}
                        >
                            <FaSearch />
                            <span>Buscar</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Area */}
            <div className="w-full transition-all duration-300 ease-in-out">
                {userFound && (
                    <div className="animate-fade-in-up bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-3 border-b border-green-200 pb-3">
                            <div className="bg-green-100 p-2 rounded-full text-green-600">
                                <FaCheck />
                            </div>
                            <span className="text-green-800 font-bold text-lg">Usuário encontrado</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-100 shadow-sm">
                            <CardUser user={userFound} />
                        </div>
                    </div>
                )}

                {notFound && (
                    <div className="animate-fade-in-up bg-orange-50 border border-orange-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-3 border-b border-orange-200 pb-3 text-orange-800">
                            <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                                <FaExclamationCircle size={20} />
                            </div>
                            <div>
                                <span className="font-bold text-lg block">Usuário não encontrado</span>
                                <span className="text-sm opacity-90">Preencha os dados abaixo para cadastrar um novo funcionário.</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-6 border border-orange-100 shadow-sm">
                            <CreateAndAddUserToCompanyForm cpf={cpfToSearch} />
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
    const { data } = useSession();
    const modalHandler = useModal();
    const queryClient = useQueryClient();

    const addEmployeeMutation = useMutation({
        mutationFn: async (user: User) => {
            const employee = new Employee({ user_id: user.id, ...user });
            try {
                await AddUserToCompany(user.email, data!);
            } catch (error: any) {
                if (error.message !== 'user already added to company' && error.message !== 'Usuário já foi adicionado à empresa') {
                    throw error;
                }
            }
            const response = await NewEmployee(user.id, data!);
            employee.id = response;
            return employee;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            notifySuccess('Funcionário criado com sucesso');
            modalHandler.hideModal('add-user-to-company');
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao criar funcionário');
        }
    });

    const newEmployee = async (user: User) => {
        if (!data) return;
        addEmployeeMutation.mutate(user);
    }

    if (!user) return null;

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 text-gray-800 text-xl font-bold pb-2 border-b border-gray-100">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <FaUserPlus />
                    </div>
                    {user.name}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-sm text-gray-600">
                        <span className="block font-medium text-gray-400 text-xs uppercase">E-mail</span>
                        {user.email}
                    </div>
                    <div className="text-sm text-gray-600">
                        <span className="block font-medium text-gray-400 text-xs uppercase">CPF</span>
                        {user.cpf}
                    </div>
                    {user.address && <div className="text-sm text-gray-600 md:col-span-2">
                        <span className="block font-medium text-gray-400 text-xs uppercase">Endereço</span>
                        {user.address?.street}, {user.address?.number} - {user.address?.neighborhood}
                        <br />
                        {user.address?.city} - CEP: {user.address?.cep}
                    </div>}
                    {user.contact && <div className="text-sm text-gray-600">
                        <span className="block font-medium text-gray-400 text-xs uppercase">Telefone</span>
                        {user.contact?.number}
                    </div>}
                </div>
            </div>

            <div className="flex items-end justify-end md:w-48">
                <button
                    onClick={() => newEmployee(user)}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 font-semibold shadow-md transition-transform transform active:scale-95"
                >
                    <FaCheck />
                    <span>Confirmar</span>
                </button>
            </div>
        </div>
    );
}

export default AddUserToCompanyForm;