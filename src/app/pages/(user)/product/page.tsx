'use client';

import { useState } from 'react';
import PageProducts from './product';
import PageCategories from './category';
import PageProcessRules from './process-rule';

const PageWithTabs = () => {
    const [activeTab, setActiveTab] = useState<'produtos' | 'categorias' | 'processos'>('produtos');

    const renderContent = () => {
        switch (activeTab) {
            case 'produtos':
                return <PageProducts />;
            case 'categorias':
                return <PageCategories />;
            case 'processos':
                return <PageProcessRules />;
            default:
                return null;
        }
    };

    return (
        <div className="container">
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'produtos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('produtos')}
                >
                    Produtos
                </button>
                <button
                    className={`tab ${activeTab === 'categorias' ? 'active' : ''}`}
                    onClick={() => setActiveTab('categorias')}
                >
                    Categorias
                </button>
                <button
                    className={`tab ${activeTab === 'processos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('processos')}
                >
                    Processos
                </button>
            </div>
            <div className="content">{renderContent()}</div>
        </div>
    );
};

export default PageWithTabs;
