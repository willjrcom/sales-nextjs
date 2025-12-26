'use client';

import Shift from '@/app/entities/shift/shift';
import { FaMoneyBillWave, FaClipboardCheck, FaExclamationTriangle } from 'react-icons/fa';
import { Redeems } from './redeem';
import Decimal from 'decimal.js';
import ListPayment from './list-payment';
import ListOrderCard from './finished-order';
import CategorySummary from './category-summary';
import ListDeliveryDriversTax from './delivery-drivers-tax';
import ProductionAnalyticsCard from '@/app/components/report/production-analytics-card';
import { useQuery } from '@tanstack/react-query';
import GetShiftByID from '@/app/api/shift/[id]/shift';
import { useSession } from 'next-auth/react';

interface SalesDashboardProps {
    shift?: Shift | null
    isUpdate?: boolean
}

const ShiftDashboard = ({ shift: initialShift, isUpdate }: SalesDashboardProps) => {
    const { data: session } = useSession();

    // Busca os dados completos do shift quando isUpdate for true
    const { data: fetchedShift } = useQuery({
        queryKey: ['shift', initialShift?.id],
        queryFn: () => GetShiftByID(initialShift!.id, session!),
        enabled: !!isUpdate && !!initialShift?.id && !!session,
        initialData: initialShift ? Object.assign(new Shift(), initialShift) : undefined,
    });

    const shift = isUpdate && fetchedShift ? Object.assign(new Shift(), fetchedShift) : initialShift ? Object.assign(new Shift(), initialShift) : null;

    if (!shift) return null;
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <SalesCard
                    title="Vendas Hoje"
                    value={"R$ " + new Decimal(shift.total_sales).toFixed(2)}
                    icon={<FaMoneyBillWave size={30} className="text-gray-800" />}
                />
                <SalesCard
                    title="Pedidos Finalizados"
                    value={shift.total_orders_finished.toString()}
                    icon={<FaClipboardCheck size={30} className="text-gray-800" />}
                />
                <SalesCard
                    title="Pedidos Cancelados"
                    value={shift.total_orders_canceled.toString()}
                    icon={<FaExclamationTriangle size={30} className="text-gray-800" />}
                />
                {isUpdate &&
                    <SalesCard
                        title="Itens Vendidos"
                        value={shift.total_items_sold.toString()}
                        icon={<FaExclamationTriangle size={30} className="text-gray-800" />}
                    />
                }
                {isUpdate &&
                    <SalesCard
                        title="Media de vendas"
                        value={"R$ " + new Decimal(shift.average_order_value).toFixed(2)}
                        icon={<FaExclamationTriangle size={30} className="text-gray-800" />}
                    />
                }
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <Redeems shift={shift} />
                <ListOrderCard shift={shift} status='Finished' title="Pedidos Finalizados" />
                <ListOrderCard shift={shift} status='Canceled' title="Pedidos Cancelados" />
                <CategorySummary shift={shift} />
                <ListPayment shift={shift} />
                <ListDeliveryDriversTax shift={shift} />
                <ProductionAnalyticsCard shift={shift} />
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
