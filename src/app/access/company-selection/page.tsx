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
import { AppDispatch, persistor, RootState, store } from '@/redux/store';
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

    useEffect(() => {
        if (data && Object.keys(userCompaniesSlice.entities).length === 0) {
            dispatch(fetchUserCompanies({ session: data } as FetchItemsArgs));
        }
    }, [data?.user.access_token, dispatch]);

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
            const company = await GetCompany(data);

            await update({
                ...data,
                user: {
                    ...data.user,
                    current_company: company,
                },
            })

            dispatch(fetchClients({ session: data } as FetchItemsArgs))
            dispatch(fetchCategories({ session: data, page: 1, perPage: 1000 } as FetchItemsArgs))
            dispatch(fetchDeliveryDrivers({ session: data } as FetchItemsArgs))
            dispatch(fetchEmployees({ session: data } as FetchItemsArgs))
            dispatch(fetchPlaces({ session: data, page: 1, perPage: 100 } as FetchItemsArgs))

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

            <div className="text-blue-500 mt-4 underline hover:text-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => signOut({ callbackUrl: '/login', redirect: true })}
            >
                Voltar ao login
            </div>
        </div>
    );
}
