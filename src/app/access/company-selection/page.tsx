'use client';

import Access from '@/app/api/auth/access/route';
import GetCompany from '@/app/api/company/route';
import RequestError from '@/app/api/error';
import { ModalProvider, useModal } from '@/app/context/modal/context';
import CompanyForm from '@/app/forms/company/form';
import { fetchCategories } from '@/redux/slices/categories';
import { fetchClients } from '@/redux/slices/clients';
import { fetchDeliveryDrivers } from '@/redux/slices/delivery-drivers';
import { fetchEmployees } from '@/redux/slices/employees';
import { fetchPlaces } from '@/redux/slices/places';
import { AppDispatch, persistor, store } from '@/redux/store';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

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
    const [error, setError] = useState<RequestError | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const modalHandler = useModal();

    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        const schemaName = event.currentTarget.getAttribute('data-schema-name');

        if (!schemaName) {
            setError(new RequestError('Schema inválido!'));
            return;
        }

        if (!data) {
            setError(new RequestError('Sessão inválida!'));
            return;
        }

        if (!data.user?.id) {
            setError(new RequestError('Token ID inválido!'));
            return;
        }

        try {
            const response = await Access({ schema: schemaName }, data);

            await update({
                ...data,
                user: {
                    idToken: response,
                },
            });

            data.user.idToken = response;
            const company = await GetCompany(data);

            await update({
                ...data,
                user: {
                    ...data.user,
                    currentCompany: company,
                },
            })

            dispatch(fetchClients(data))
            dispatch(fetchCategories(data))
            dispatch(fetchDeliveryDrivers(data))
            dispatch(fetchEmployees(data))
            dispatch(fetchPlaces(data))

            router.push('/');
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    const newCompany = () => {
        const onClose = () => {
            modalHandler.hideModal("new-company")
        }

        modalHandler.showModal("new-company", "Nova empresa", <CompanyForm />, "md", onClose)
    }
    
    if (!data?.user?.companies || data.user.companies.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
                <h2 className="text-2xl font-bold">Não existem empresas disponíveis.</h2>
                <p className="text-lg">Por favor, entre em contato com a empresa responsável pela sua conta.</p>
                <div className="text-blue-500 mt-4 underline hover:text-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" onClick={() => signOut({ callbackUrl: '/login', redirect: true })}>Voltar ao login</div>

                <Link href={"/pages/new-company"}>
                    <div className={`fixed bottom-5 right-5 flex items-center justify-center space-x-2 p-4 bg-yellow-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:bg-yellow-600 w-max`}
                        style={{ zIndex: 1000 }}
                    >
                        <FaPlus className="text-sm" />
                        <span>Nova empresa</span>
                    </div>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <h1 className="text-4xl mb-10">Selecione uma Empresa</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.user.companies.map(company => (
                    <button
                        key={company.schema_name}
                        data-schema-name={company.schema_name}
                        onClick={handleSubmit}
                        className="block p-6 bg-white rounded-lg shadow-lg hover:bg-yellow-500 hover:text-white transition"
                    >
                        <h2 className="text-2xl font-bold">{company.trade_name}</h2>
                    </button>
                ))}
                <button onClick={newCompany}>
                    <div className={`fixed bottom-5 right-5 flex items-center justify-center space-x-2 p-4 bg-yellow-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:bg-yellow-600 w-max`}
                        style={{ zIndex: 1000 }}
                    >
                        <FaPlus className="text-sm" />
                        <span>Nova empresa</span>
                    </div>
                </button>
            </div>

            <div className="text-blue-500 mt-4 underline hover:text-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" onClick={() => signOut({ callbackUrl: '/login', redirect: true })}>Voltar ao login</div>
        </div>
    );
}
