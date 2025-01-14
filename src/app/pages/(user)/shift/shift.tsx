'use client';

import RequestError from '@/app/api/error';
import CloseShift from '@/app/api/shift/close/route';
import GetCurrentShift from '@/app/api/shift/current/route';
import OpenShift from '@/app/api/shift/open/route';
import ButtonsModal from '@/app/components/modal/buttons-modal';
import PriceField from '@/app/components/modal/fields/price';
import { useModal } from '@/app/context/modal/context';
import Shift from '@/app/entities/shift/shift';
import User from '@/app/entities/user/user';
import { ToUtcHoursMinutes, ToUtcDate, ToUtcDatetime } from '@/app/utils/date';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaShoppingCart, FaMoneyBillWave, FaClipboardCheck, FaExclamationTriangle } from 'react-icons/fa';

interface ChangeCardProps {
    openedAt: string;
}

const ChangeCard = ({ openedAt }: ChangeCardProps) => {

    const [endChange, setEndChange] = useState<number>(0);
    const [error, setError] = useState<RequestError | null>();
    const { data } = useSession();
    const router = useRouter();
    const modalHandler = useModal();

    const handleCloseShift = async (endChange: number) => {
        if (!data) return;

        try {
            await CloseShift(endChange, data)
            setError(null);
            modalHandler.hideModal("close-shift")
            router.refresh()
        } catch (error) {
            setError(error as RequestError);
        }
    }

    return (
        <>
            {error && <p className="text-red-500">{error.message}</p>}
            <PriceField friendlyName='Troco final' name='end_change' value={endChange} setValue={setEndChange} />
            <ButtonsModal item={{ id: "", name: "Fechar turno" }} onSubmit={() => handleCloseShift(endChange)} name={'Turno: ' + ToUtcDatetime(openedAt)} />
        </>
    )
}

interface ShiftProps {
    shift?: Shift | null;
}

const ShiftCard = ({ shift }: ShiftProps) => {
    const { data } = useSession();
    const [user, setUser] = useState<User>(new User());
    const [startChange, setStartChange] = useState<number>(shift?.start_change || 0);
    const [error, setError] = useState<RequestError | null>();
    const modalHandler = useModal();
    const router = useRouter();

    useEffect(() => {
        if (!data?.user.user) return;

        setUser(data?.user.user);
    }, [data?.user.user]);

    const handleOpenShift = async () => {
        if (!data) return;

        try {
            await OpenShift(startChange, data)
            setError(null);
            
        } catch (error) {
            setError(error as RequestError);
        }
    }

    const onOpenModal = (shift: Shift) => {
        const onClose = () => {
            modalHandler.hideModal("close-shift")
        }

        modalHandler.showModal("close-shift", "Fechar turno", <ChangeCard openedAt={shift.opened_at} />, "md", onClose)
    }

    if (!shift) {
        return (
            <div className="bg-white p-4 shadow-md rounded-lg flex items-center">
                <div>
                    <h2 className="text-xl font-bold">Olá, {user.name}</h2>
                    <p className="text-gray-500">Nenhum turno aberto</p>
                </div>

                <div className="ml-auto text-right justify-around block">
                    <PriceField friendlyName='Troco inicial' name='start_change' value={startChange} setValue={setStartChange} />
                    <button className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        onClick={handleOpenShift}>Abrir turno</button>
                    {error && <p className="text-red-500">{error.message}</p>}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white p-4 shadow-md rounded-lg flex items-center">
            <div>
                <h2 className="text-xl font-bold">Olá, {user.name}</h2>
                <p>Turno aberto às: <span className="font-semibold">{ToUtcHoursMinutes(shift.opened_at)}</span></p>
                <p>Data: <span className="font-semibold">{ToUtcDate(shift.opened_at)}</span></p>
                {error && <p className="text-red-500">{error.message}</p>}
            </div>

            <div className="ml-auto text-right justify-around block">
                <div className="ml-auto text-right">
                    <p>Troco início: <span className="font-semibold">R$ {shift.start_change.toFixed(2)}</span></p>
                    <button className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Resgatar Dinheiro</button>
                </div>

                <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => onOpenModal(shift)}>Fechar Turno</button>
            </div>
        </div >
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
                                <Image src="/img_login.jpg" alt={sale.name} width={40} height={40} className="rounded-full mr-4" />
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
    const [shift, setShift] = useState<Shift | null>();
    const [error, setError] = useState<RequestError | null>();
    const { data } = useSession();

    const fetchCurrentShift = async () => {
        if (!data) return;

        try {
            const currentShift = await GetCurrentShift(data);
            console.log(currentShift)
            setError(null);
            setShift(currentShift);

        } catch (error) {
            setError(error as RequestError)
        }
    }

    useEffect(() => {
        fetchCurrentShift()
    }, [data?.user])

    const totalOrders = shift?.orders?.length || 0;
    const totalFinishedOrders = shift?.orders?.filter(order => order.status === 'Finished').length || 0;
    const totalCanceledOrders = shift?.orders?.filter(order => order.status === 'Canceled').length || 0;
    const totalSales = shift?.orders?.reduce((total, order) => total + order.total_payable, 0) || 0;

    return (
        <div className="p-8 bg-gray-100 h-[80vh] overflow-y-auto">
            <ShiftCard shift={shift} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <SalesCard
                    title="Pedidos Cancelados"
                    value={totalCanceledOrders.toString()}
                    icon={<FaExclamationTriangle size={30} className="text-gray-800" />}
                />
                <SalesCard
                    title="Vendas Hoje"
                    value={"R$ " + totalSales.toFixed(2)}
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
            </div>
            <div className="mt-6">
                {/* <TopSales /> */}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* <ReviewCard /> */}
                <SalesSummary />
            </div>
        </div>
    )
}

export default ShiftDashboard;
