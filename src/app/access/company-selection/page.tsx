'use client';

import Access from '@/app/api/auth/access/access';
import GetCompany from '@/app/api/company/company';
import RequestError from '@/app/utils/error';
import { ModalProvider, useModal } from '@/app/context/modal/context';
import CompanyForm from '@/app/forms/company/form';
import Loading from '@/app/components/loading/Loading';
import { fetchCategories } from '@/redux/slices/categories';
import { fetchClients } from '@/redux/slices/clients';
import { fetchDeliveryDrivers } from '@/redux/slices/delivery-drivers';
import { fetchEmployees } from '@/redux/slices/employees';
import { fetchPlaces } from '@/redux/slices/places';
import { AppDispatch, persistor, RootState, store, resetApp } from '@/redux/store';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { fetchUserCompanies } from '@/redux/slices/user-companies';
import Company from '@/app/entities/company/company';
import Refresh from '@/app/components/crud/refresh';
import { FetchItemsArgs } from '@/redux/slices/generics';
import { notifyError } from '@/app/utils/notifications';
import EmployeeUserProfile from '@/app/components/profile/profile';
import Link from 'next/link';

export default function Page() {
    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <ModalProvider>
                    <CompanySelection />
                </ModalProvider>
            </PersistGate>
        </Provider>
    )
}

function CompanySelection() {
    const router = useRouter();
    const { data, update } = useSession();
    const [companies, setCompanies] = useState<Company[]>([]);
    const userCompaniesSlice = useSelector((state: RootState) => state.userCompanies);
    const dispatch = useDispatch<AppDispatch>();
    const modalHandler = useModal();
    const [selecting, setSelecting] = useState<boolean>(false);
    const loadingCompanies = userCompaniesSlice.loading;

    // Clear entire redux store + persisted storage every time this page is visited
    useEffect(() => {
        // run async reset
        (async () => {
            try {
                await resetApp();
            } catch (err) {
                // ignore
            }
        })();
    }, []);

    useEffect(() => {
        const token = data?.user?.access_token;
        const hasCompanies = userCompaniesSlice.ids.length > 0;

        if (token && !hasCompanies) {
            dispatch(fetchUserCompanies({ session: data } as FetchItemsArgs));
        }
    }, [data?.user?.access_token, userCompaniesSlice.ids.length]);

    useEffect(() => {
        const companiesFound = Object.values(userCompaniesSlice.entities) || []
        setCompanies(companiesFound.sort((a, b) => a.trade_name.localeCompare(b.trade_name)))
    }, [userCompaniesSlice.entities]);

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

            await update({
                ...data,
                user: {
                    ...data.user,
                },
            })

            dispatch(fetchClients({ session: data, page: 1, perPage: 10 } as FetchItemsArgs))
            dispatch(fetchEmployees({ session: data, page: 1, perPage: 10 } as FetchItemsArgs))
            dispatch(fetchCategories({ session: data } as FetchItemsArgs))
            dispatch(fetchDeliveryDrivers({ session: data } as FetchItemsArgs))
            dispatch(fetchPlaces({ session: data } as FetchItemsArgs))

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
                        Bem-vindo, {data?.user?.user?.name?.split(' ')[0] || 'Usuário'}
                    </h1>
                </div>
                {data?.user?.user && <EmployeeUserProfile user={data?.user.user} />}
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
                <Refresh slice={userCompaniesSlice} fetchItems={fetchUserCompanies} removeText />
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
