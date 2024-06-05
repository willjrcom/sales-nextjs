'use client';
import Access from '@/app/api/auth/access/route';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CompanySelection() {
    const router = useRouter();
    const { data } = useSession();
    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const schemaName = event.currentTarget.getAttribute('data-schema-name');
        if (schemaName && data) {
            const response = await Access({ schema: schemaName }, data);
            if (response) {
                data.idToken = response
                router.push('/');
            }
        } else {
            prompt('schema ou sessao invalida!');;
        }
    }

    if (!data || !data?.companies) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
                <h2 className="text-2xl font-bold">Não existem empresas disponíveis.</h2>
                <p className="text-lg">Por favor, entre em contato com a empresa responsável pela sua conta.</p>
                <div className="text-blue-500 mt-4 underline hover:text-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" onClick={() => signOut({ callbackUrl: '/login', redirect: true })}>Voltar ao login</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
            <h1 className="text-4xl mb-10">Selecione uma Empresa</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.companies?.map(company => (
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
            <div className="text-blue-500 mt-4 underline hover:text-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" onClick={() => signOut({ callbackUrl: '/login', redirect: true })}>Voltar ao login</div>
        </div>
    );
}
