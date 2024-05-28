'use client';
import { useRouter } from 'next/navigation';

export default function CompanySelection() {
    const companies = [
        { id: 1, name: 'Empresa A' },
        { id: 2, name: 'Empresa B' },
        { id: 3, name: 'Empresa C' }
    ];

    const router = useRouter();

    const handleSubmit = () => {
      event.preventDefault();
      router.push('/');
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
            <h1 className="text-4xl mb-10">Selecione uma Empresa</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map(company => (
                    <button key={company.id} onClick={handleSubmit} className="block p-6 bg-white rounded-lg shadow-lg hover:bg-yellow-500 hover:text-white transition">
                            <h2 className="text-2xl font-bold">{company.name}</h2>
                    </button>
                ))}
            </div>
        </div>
    )
}
