'use client';

import { useState } from 'react';
import PageProducts from './product';
import PageCategories from './category';
import PageProcessRules from './process-rule';
import "./style.css";

const PageWithTabs = () => {
    const [activeTab, setActiveTab] = useState<'produtos' | 'categorias' | 'processos'>('produtos');

    const renderContent = () => {
        switch (activeTab) {
            case 'categorias':
                return <PageCategories />;
            case 'produtos':
                return <PageProducts />;
            case 'processos':
                return <PageProcessRules />;
            default:
                return null;
        }
    };

    return (
        <div>
            <button
                className={`tab ${activeTab === 'categorias' ? 'active' : ''}`}
                onClick={() => setActiveTab('categorias')}
            >
                Categorias
            </button>
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'produtos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('produtos')}
                >
                    Produtos
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
