'use client';

import { useState } from 'react';
import PageProducts from './product';
import Menu from '@/app/components/menu/layout';
import { ProductProvider } from '@/app/context/product/context';
import PageCategories from './category';
import { CategoryProvider } from '@/app/context/category/context';

const PageWithTabs = () => {
    const [activeTab, setActiveTab] = useState<'produtos' | 'categorias'>('produtos');

    const renderContent = () => {
        switch (activeTab) {
            case 'produtos':
                return <PageProducts />;
            case 'categorias':
                return <PageCategories />;
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
                            </div>
                            <div className="content">{renderContent()}</div>
                        </div>
                </ProductProvider>
            </CategoryProvider>
        </Menu>
    );
};

export default PageWithTabs;
