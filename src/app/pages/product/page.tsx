'use client';

import { useState } from 'react';
import PageProducts from './product';
import Menu from '@/app/components/menu/layout';
import { ProductProvider } from '@/app/context/product/context';
import PageCategories from './category';
import { CategoryProvider } from '@/app/context/category/context';

const Categorias = () => <div>Conteúdo de Categorias</div>;
const Processos = () => <div>Conteúdo de Processos</div>;

const PageWithTabs = () => {
    const [activeTab, setActiveTab] = useState<'produtos' | 'categorias' | 'processos'>('produtos');

    const renderContent = () => {
        switch (activeTab) {
            case 'produtos':
                return <PageProducts />;
            case 'categorias':
                return <PageCategories />;
            case 'processos':
                return <Processos />;
            default:
                return null;
        }
    };

    return (
        <Menu>
            <CategoryProvider>
                <ProductProvider>
                <div className="container">
                    <h1 className="title">Produtos</h1>
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
                </ProductProvider>
            </CategoryProvider>
        </Menu>
    );
};

export default PageWithTabs;
