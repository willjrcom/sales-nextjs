'use client';

import Shift from '@/app/entities/shift/shift';
import { FaShoppingCart, FaMoneyBillWave, FaClipboardCheck, FaExclamationTriangle } from 'react-icons/fa';
import { Redeems } from './redeem';
import Decimal from 'decimal.js';

interface SalesDashboardProps {
    shift?: Shift | null
}

const ShiftDashboard = ({ shift }: SalesDashboardProps) => {
    if (!shift) return 
    
    shift = Object.assign(new Shift(), shift);
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <SalesCard
                    title="Vendas Hoje"
                    value={"R$ " + new Decimal(shift.getTotalSales()).toFixed(2)}
                    icon={<FaMoneyBillWave size={30} className="text-gray-800" />}
                />
                <SalesCard
                    title="Total de Pedidos"
                    value={shift.getTotalOrders().toString()}
                    icon={<FaShoppingCart size={30} className="text-gray-800" />}
                />
                <SalesCard
                    title="Pedidos Finalizados"
                    value={shift.getTotalFinishedOrders().toString()}
                    icon={<FaClipboardCheck size={30} className="text-gray-800" />}
                />
                <SalesCard
                    title="Pedidos Cancelados"
                    value={shift.getTotalCanceledOrders().toString()}
                    icon={<FaExclamationTriangle size={30} className="text-gray-800" />}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <Redeems shift={shift} />
            </div>

        </div>
    )
}

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

export default ShiftDashboard;
