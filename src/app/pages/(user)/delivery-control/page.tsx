'use client';

import { useState } from "react";
import "./style.css";
import DeliveryOrderToShip from "./delivery-to-ship";

const PageDeliveryOrder = () => {
    const [activeTab, setActiveTab] = useState<'A enviar' | 'Na rua' | 'Finalizadas'>('A enviar');

    const renderContent = () => {
        switch (activeTab) {
            case 'A enviar':
                return <DeliveryOrderToShip />;
            case 'Na rua':
                return <h1>Na rua</h1>;
            case 'Finalizadas':
                return <h1>Finalizadas</h1>;;
            default:
                return null;
        }
    };

    return (
        <div>
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