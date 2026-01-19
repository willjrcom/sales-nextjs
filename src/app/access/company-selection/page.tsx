'use client';

import Access from '@/app/api/auth/access/access';
import RequestError from '@/app/utils/error';
import { ModalProvider, useModal } from '@/app/context/modal/context';
import CompanyForm from '@/app/forms/company/form';
import Loading from '@/app/components/loading/Loading';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import Refresh, { FormatRefreshTime } from '@/app/components/crud/refresh';
import { notifyError } from '@/app/utils/notifications';
import EmployeeUserProfile from '@/app/components/profile/profile';
import Link from 'next/link';
import GetUser from '@/app/api/user/me/user';
import User from '@/app/entities/user/user';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import GetUserCompanies from '@/app/api/user/companies/user';

export default function Page() {
    return (
        <ModalProvider>
            <CompanySelection />
        </ModalProvider>
    )
}

function CompanySelection() {
    const router = useRouter();
    const { data, update } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const modalHandler = useModal();
    const [selecting, setSelecting] = useState<boolean>(false);
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const queryClient = useQueryClient();

    const { isPending: loadingCompanies, error, data: companiesResponse, refetch } = useQuery({
        queryKey: ['user-companies'],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetUserCompanies(data!);
        },
        enabled: !!data?.user?.access_token,
    });

    const companies = useMemo(() => companiesResponse?.items.sort((a, b) => a.trade_name.localeCompare(b.trade_name)) || [], [companiesResponse?.items]);

    useEffect(() => {
        if (error) notifyError('Erro ao carregar empresas');
    }, [error]);

    useEffect(() => {
        getUser();
    }, [data?.user?.access_token]);

    const getUser = async () => {
        if (!data) return;
        const user = await GetUser(data);
        setUser(user);
    }

    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        const schemaName = event.currentTarget.getAttribute('data-schema-name');

        if (!schemaName) {
            notifyError('Schema inválido!');
            return;
        }

        if (!data) {
            notifyError('Sessão inválida!');
            return;
        }

        if (!data.user?.id) {
            notifyError('Token ID inválido!');
            return;
        }

        setSelecting(true);
        try {
            const response = await Access({ schema: schemaName }, data);

            await update({
                ...data,
                user: {
                    access_token: response,
                },
            });

            data.user.access_token = response;
            router.push('/pages/new-order');
            setSelecting(false);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Ocorreu um erro ao selecionar a empresa');
            setSelecting(false);
        }
    }

    const newCompany = () => {
        const onClose = () => {
            modalHandler.hideModal("new-company")
        }

        modalHandler.showModal("new-company", "Nova empresa", <CompanyForm />, "md", onClose)
    }

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100 text-black">
            <div className="absolute top-4 left-4 z-10">
                <Link
                    href="/access/admin"
                    className="px-4 py-2 rounded-lg bg-yellow-500 text-white font-semibold shadow hover:bg-yellow-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                    Acessar APIs públicas
                </Link>
            </div>
            <div className="absolute top-4 right-4 z-10 flex items-center gap-4">
                <div className="text-right">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                        Bem-vindo, {user?.name?.split(' ')[0] || 'Usuário'}
                    </h1>
                </div>
                {user && <EmployeeUserProfile user={user} setUser={setUser} />}
            </div>
            {loadingCompanies && (
                <div className="flex justify-center items-center h-64 mb-10">
                    <Loading />
                </div>
            )}
            {selecting && (
                <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75 z-50">
                    <Loading />
                </div>
            )}

            {!loadingCompanies && companies.length > 0 && <div className='flex justify-center items-center gap-4 mb-10'>
                <h2 className="text-2xl">Selecione uma Empresa</h2>
                <Refresh onRefresh={refetch} isPending={loadingCompanies} lastUpdate={lastUpdate} removeText={true} />
            </div>}

            {!loadingCompanies && (companies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <h2 className="text-2xl font-bold text-center">Não existem empresas disponíveis.</h2>
                    <p className="text-lg text-center">Por favor, cadastre a sua nova empresa</p>
                    <p className="text-lg text-center">ou</p>
                    <p className="text-lg text-center">entre em contato com a empresa responsável pela sua conta.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map(company => (
                        <button
                            key={company.schema_name}
                            data-schema-name={company.schema_name}
                            onClick={handleSubmit}
                            className="block p-6 bg-white rounded-lg shadow-lg hover:bg-yellow-500 hover:text-white transition"
                        >
                            <h2 className="text-2xl font-bold">{company.trade_name}</h2>
                        </button>
                    ))}
                </div>
            ))}

            <button onClick={newCompany}>
                <div className="fixed bottom-5 right-5 flex items-center justify-center space-x-2 p-4 bg-yellow-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:bg-yellow-600 w-max"
                    style={{ zIndex: 1000 }}
                >
                    <FaPlus className="text-sm" />
                    <span>Nova empresa</span>
                </div>
            </button>

            <button
                onClick={() => signOut({ callbackUrl: '/login', redirect: true })}
                className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
            >
                Voltar ao login
            </button>
        </div>
    );
}
