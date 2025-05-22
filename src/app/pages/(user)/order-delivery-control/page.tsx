'use client';

import { useState } from "react";
import PageTitle from '@/app/components/PageTitle';
import "./style.css";
import DeliveryOrderToShip from "./delivery-to-ship";
import DeliveryOrderToFinish from "./delivery-to-finish";
import DeliveryOrderFinished from "./delivery-finished";

const PageDeliveryOrder = () => {
    const [activeTab, setActiveTab] = useState<'A enviar' | 'Na rua' | 'Finalizadas'>('A enviar');

    const renderContent = () => {
        switch (activeTab) {
            case 'A enviar':
                return <DeliveryOrderToShip />;
            case 'Na rua':
                return <DeliveryOrderToFinish />;
            case 'Finalizadas':
                return <DeliveryOrderFinished />;
            default:
                return null;
        }
    };

    return (
        <div>
            <PageTitle title="Controle de Entregas" tooltip="Gerencie pedidos de entrega por status: A enviar, Na rua ou Finalizadas." />
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'A enviar' ? 'active' : ''}`}
                    onClick={() => setActiveTab('A enviar')}
                >
                    A enviar
                </button>
                <button
                    className={`tab ${activeTab === 'Na rua' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Na rua')}
                >
                    Na rua
                </button>
                <button
                    className={`tab ${activeTab === 'Finalizadas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Finalizadas')}
                >
                    Finalizadas
                </button>
            </div>
            <div className="content">{renderContent()}</div>
        </div>
    );
};


export default PageDeliveryOrder