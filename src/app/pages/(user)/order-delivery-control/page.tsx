'use client';

import { useState } from "react";
import PageTitle from '@/app/components/PageTitle';
// removed local CSS import; using Tailwind classes instead
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
        <div className="max-w-7xl mx-auto p-6">
            <PageTitle title="Controle de Entregas" tooltip="Gerencie pedidos de entrega por status: A enviar, Na rua ou Finalizadas." />
            <div className="flex border-b border-gray-200 bg-gray-100 p-2">
                <button
                    onClick={() => setActiveTab('A enviar')}
                    className={`w-full py-2.5 px-4 text-center text-sm font-medium transition-all ease-in-out duration-200 cursor-pointer ${activeTab === 'A enviar'
                            ? 'bg-white text-gray-900 border border-gray-200 border-b-0'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        } hover:bg-white hover:text-gray-900 hover:shadow`}
                >
                    A enviar
                </button>
                <button
                    onClick={() => setActiveTab('Na rua')}
                    className={`w-full py-2.5 px-4 text-center text-sm font-medium transition-all ease-in-out duration-200 cursor-pointer ${activeTab === 'Na rua'
                            ? 'bg-white text-gray-900 border border-gray-200 border-b-0'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        } hover:bg-white hover:text-gray-900 hover:shadow`}
                >
                    Na rua
                </button>
                <button
                    onClick={() => setActiveTab('Finalizadas')}
                    className={`w-full py-2.5 px-4 text-center text-sm font-medium transition-all ease-in-out duration-200 cursor-pointer ${activeTab === 'Finalizadas'
                            ? 'bg-white text-gray-900 border border-gray-200 border-b-0'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        } hover:bg-white hover:text-gray-900 hover:shadow`}
                >
                    Finalizadas
                </button>
            </div>
            <div className="mt-4 p-4 bg-white border border-gray-200 rounded">
                {renderContent()}
            </div>
        </div>
    );
};


export default PageDeliveryOrder