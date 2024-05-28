import { FaShoppingCart, FaMoneyBillWave, FaClipboardCheck, FaExclamationTriangle } from 'react-icons/fa';

const Header = () => {
    return (
        <header className="bg-gray-100 p-4 shadow-md">
            <h1 className="text-3xl font-bold text-gray-800">Turno</h1>
        </header>
    )
}

const UserCard = () => {
    return (
        <div className="bg-white p-4 shadow-md rounded-lg flex items-center">
            <img src="/img_login.jpg" alt="User" className="w-16 h-16 rounded-full mr-4" />
            <div>
                <h2 className="text-xl font-bold">Olá, Patrik</h2>
                <p>Turno aberto às: <span className="font-semibold">18:30</span></p>
                <p>Data: <span className="font-semibold">05/02/2024</span></p>
            </div>
            <div className="ml-auto text-right">
                <p>Troco início: <span className="font-semibold">R$ 75,00</span></p>
                <button className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Resgatar Dinheiro</button>
            </div>
        </div>
    )
}
interface SalesCardProps {
    title: string;
    value: string;
    change: string;
    icon: JSX.Element;
}

const SalesCard: React.FC<SalesCardProps> = ({ title, value, change, icon }) => {
    return (
        <div className="bg-white p-4 shadow-md rounded-lg flex items-center">
            <div className="mr-4">{icon}</div>
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-xl font-bold">{value}</p>
                <p className={`text-sm ${change.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>{change}</p>
            </div>
        </div>
    )
}
const ReviewCard = () => {
    return (
        <div className="bg-white p-4 shadow-md rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Revisões</h3>
            <div className="mb-2">
                <span className="font-bold">Positivos: 80%</span>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "80%" }}></div>
                </div>
            </div>
            <div className="mb-2">
                <span className="font-bold">Neutros: 12%</span>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: "12%" }}></div>
                </div>
            </div>
            <div>
                <span className="font-bold">Negativos: 8%</span>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div className="bg-red-600 h-2.5 rounded-full" style={{ width: "8%" }}></div>
                </div>
            </div>
            <p className="text-gray-600">Mais de 450 pessoas fizeram revisões em seu estabelecimento.</p>
            <button className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">Ver todas as revisões</button>
        </div>
    )
}
const SalesSummary = () => {
    return (
        <div className="bg-white p-4 shadow-md rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Vendas</h3>
            <div className="w-full bg-gray-200 rounded-lg h-64 mb-4">
                {/* Gráfico de vendas - pode ser substituído por um gráfico real usando uma biblioteca como Chart.js */}
                <div className="flex items-center justify-center h-full">[Gráfico de Vendas]</div>
            </div>
            <p className="text-lg font-bold">Total: R$ 4.318,77</p>
            <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Fechar Turno</button>
        </div>
    )
}

const TopSales = () => {
    const topSales = [
        { id: 1, name: 'Hotdog Especial', quantity: 1543, grossValue: 'R$ 32.219,95', netValue: 'R$ 8.123,42', profit: '12%' },
        { id: 2, name: 'Hotdog Especial', quantity: 1543, grossValue: 'R$ 32.219,95', netValue: 'R$ 8.123,42', profit: '12%' },
        { id: 3, name: 'Hotdog Especial', quantity: 1543, grossValue: 'R$ 32.219,95', netValue: 'R$ 8.123,42', profit: '12%' },
    ];

    return (
        <div className="bg-white p-4 shadow-md rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Top de Vendas</h3>
            <table className="w-full text-left">
                <thead>
                    <tr>
                        <th className="pb-2">Produto</th>
                        <th className="pb-2">Pedidos</th>
                        <th className="pb-2">Valor Bruto</th>
                        <th className="pb-2">Valor Líquido</th>
                        <th className="pb-2">Lucro</th>
                    </tr>
                </thead>
                <tbody>
                    {topSales.map((sale) => (
                        <tr key={sale.id} className="border-t">
                            <td className="py-2 flex items-center">
                                <img src="/img_login.jpg" alt={sale.name} className="w-10 h-10 rounded-full mr-4" />
                                {sale.name}
                            </td>
                            <td className="py-2">{sale.quantity}</td>
                            <td className="py-2">{sale.grossValue}</td>
                            <td className="py-2">{sale.netValue}</td>
                            <td className="py-2 text-green-500">{sale.profit}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const ShiftDashboard = () => {
    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <UserCard />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <SalesCard
                    title="Total de Vendas"
                    value="203"
                    change="+55%"
                    icon={<FaShoppingCart size={30} className="text-gray-800" />}
                />
                <SalesCard
                    title="Pedidos Cancelados"
                    value="2"
                    change="-33%"
                    icon={<FaExclamationTriangle size={30} className="text-gray-800" />}
                />
                <SalesCard
                    title="Vendas Hoje"
                    value="R$ 2.109,32"
                    change="+15%"
                    icon={<FaMoneyBillWave size={30} className="text-gray-800" />}
                />
                <SalesCard
                    title="Pedidos Finalizados"
                    value="28"
                    change="+55%"
                    icon={<FaClipboardCheck size={30} className="text-gray-800" />}
                />
            </div>
            <div className="mt-6">
                <TopSales />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <ReviewCard />
                <SalesSummary />
            </div>
        </div>
    )
}

export default ShiftDashboard;
