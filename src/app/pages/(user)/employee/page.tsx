'use client';

import { useState } from 'react';
import "./style.css";
import PageEmployee from './employee';
import PageDeliveryDriver from './delivery-driver';

const PageWithTabs = () => {
    const [activeTab, setActiveTab] = useState<'funcionarios' | 'motoboys'>('funcionarios');

    const renderContent = () => {
        switch (activeTab) {
            case 'funcionarios':
                return <PageEmployee />;
            case 'motoboys':
                return <PageDeliveryDriver />;
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'funcionarios' ? 'active' : ''}`}
                    onClick={() => setActiveTab('funcionarios')}
                >
                    Funcionários
                </button>
                <button
                    className={`tab ${activeTab === 'motoboys' ? 'active' : ''}`}
                    onClick={() => setActiveTab('motoboys')}
                >
                    Motoboys
                </button>
            </div>
            <div className="content">{renderContent()}</div>
        </div>
    );
};

export default PageWithTabs;
