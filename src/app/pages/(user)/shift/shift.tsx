'use client';

import RequestError from '@/app/utils/error';
import GetCurrentShift from '@/app/api/shift/current/shift';
import Shift from '@/app/entities/shift/shift';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { FaShoppingCart, FaMoneyBillWave, FaClipboardCheck, FaExclamationTriangle } from 'react-icons/fa';
import ShiftCard from './shift-card';
import ShiftResume from './shift-resume';
import { Redeems } from './redeem';
import Decimal from 'decimal.js';
import { notifyError } from '@/app/utils/notifications';

interface SalesCardProps {
    title: string;
    value: string;
    change?: string;
    icon: JSX.Element;
}

const SalesCard = ({ title, value, change, icon }: SalesCardProps) => {
    return (
        <div className="bg-white p-4 shadow-md rounded-lg flex items-center">
            <div className="mr-4">{icon}</div>
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-xl font-bold">{value}</p>
                {change && <p className={`text-sm ${change.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>{change}</p>}
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
        </div>
    )
}

const ShiftDashboard = () => {
    const [shift, setShift] = useState<Shift | null>();
    const { data } = useSession();

    const fetchCurrentShift = async () => {
        if (!data) return;

        try {
            const currentShift = await GetCurrentShift(data);
            setShift(currentShift);

        } catch (error: RequestError | any) {
            setShift(null)
        }
    }

    useEffect(() => {
        fetchCurrentShift()
    }, [data?.user.access_token])

    const totalOrders = shift?.orders?.length || 0;
    const totalFinishedOrders = shift?.orders?.filter(order => order.status === 'Finished').length || 0;
    const totalCanceledOrders = shift?.orders?.filter(order => order.status === 'Canceled').length || 0;
    const totalSales = shift?.orders?.filter(order => order.status === 'Finished')
        .reduce((total: Decimal, order) => new Decimal(total).plus(new Decimal(order.total_payable)), new Decimal(0)) || 0;

    return (
        <div className="p-8 bg-gray-100 h-[80vh] overflow-y-auto">
            <ShiftCard shift={shift} fetchShift={fetchCurrentShift} />

            {shift &&
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                    <SalesCard
                        title="Vendas Hoje"
                        value={"R$ " + new Decimal(totalSales).toFixed(2)}
                        icon={<FaMoneyBillWave size={30} className="text-gray-800" />}
                    />
                    <SalesCard
                        title="Total de Pedidos"
                        value={totalOrders.toString()}
                        icon={<FaShoppingCart size={30} className="text-gray-800" />}
                    />
                    <SalesCard
                        title="Pedidos Finalizados"
                        value={totalFinishedOrders.toString()}
                        icon={<FaClipboardCheck size={30} className="text-gray-800" />}
                    />
                    <SalesCard
                        title="Pedidos Cancelados"
                        value={totalCanceledOrders.toString()}
                        icon={<FaExclamationTriangle size={30} className="text-gray-800" />}
                    />
                </div>
            }

            {shift &&
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    {/* <ShiftResume shift={shift} /> */}
                    {/* <SalesSummary /> */}
                    <Redeems shift={shift} />
                </div>
            }
        </div>
    )
}

export default ShiftDashboard;
