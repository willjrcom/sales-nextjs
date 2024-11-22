'use client';

import { useState } from 'react';
import PageProducts from './product';
import Menu from '@/app/components/menu/layout';
import { ProductProvider } from '@/app/context/product/context';
import PageCategories from './category';
import { CategoryProvider } from '@/app/context/category/context';
import PageProcessRules from './process-rule';
import { ProcessRuleProvider } from '@/app/context/process-rule/context';

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
        <Menu>
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
                <CategoryProvider>
                    <ProductProvider>
                        <ProcessRuleProvider>
                            <div className="content">{renderContent()}</div>
                        </ProcessRuleProvider>
                    </ProductProvider>
                </CategoryProvider>
            </div>
        </Menu>
    );
};

export default PageWithTabs;
