"use client";

import { useState, useEffect, useMemo } from "react";
import PageTitle from '@/app/components/PageTitle';
import "./style.css";
import Refresh from "@/app/components/crud/refresh";
import CrudTable from "@/app/components/crud/table";
import { fetchPickupOrders } from "@/redux/slices/pickup-orders";
import { AppDispatch, RootState } from "@/redux/store";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import PickupOrderColumns from "@/app/entities/order/pickup-table-columns";

const PickupOrderPage = () => {
    const ordersSlice = useSelector((state: RootState) => state.pickupOrders);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();
    const [activeTab, setActiveTab] = useState<'Prontas'|'Últimos 10'>('Prontas');

    // fetch and polling
    useEffect(() => {
        if (data && Object.keys(ordersSlice.entities).length === 0) {
            dispatch(fetchPickupOrders({ session: data }));
        }
        const interval = setInterval(() => { if (data) dispatch(fetchPickupOrders({ session: data })); }, 30000);
        return () => clearInterval(interval);
    }, [data?.user.access_token, dispatch]);

    // derive orders list
    const allOrders = useMemo(() => Object.values(ordersSlice.entities), [ordersSlice.entities]);
    
    // last 10 ready
    const last10 = useMemo(() => [...allOrders].sort((a,b) => {
        const da = a.pickup?.ready_at || '';
        const db = b.pickup?.ready_at || '';
        return db.localeCompare(da);
    }).slice(0,10), [allOrders]);

    const renderContent = () => {
        const dataToShow = activeTab === 'Prontas' ? allOrders : last10;
        if (dataToShow.length === 0) {
            return <p className="text-gray-500">Nenhum pedido disponível</p>;
        }
        return <CrudTable columns={PickupOrderColumns()} data={dataToShow} />;
    };

    return (
        <div className="container">
            <PageTitle title="Controle de Retiradas" tooltip="Gerencie pedidos de retirada por status." />
            <div className="tabs">
                <button className={`tab ${activeTab==='Prontas'?'active':''}`} onClick={()=>setActiveTab('Prontas')}>Prontas</button>
                <button className={`tab ${activeTab==='Últimos 10'?'active':''}`} onClick={()=>setActiveTab('Últimos 10')}>Últimos 10</button>
            </div>
            <div className="content">
                <div className="flex justify-end items-center mb-2">
                    <Refresh slice={ordersSlice} fetchItems={fetchPickupOrders} />
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

interface ModalData {
    pickupIDs: string[];
    orderIDs: string[];
}

export default PickupOrderPage