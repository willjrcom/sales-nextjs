
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GetCategoriesMap } from '@/app/api/category/category';
import { GetDefaultProducts } from '@/app/api/product/product';
import React, { useMemo } from 'react';
import GroupItem from '@/app/entities/order/group-item';
import { useSession } from 'next-auth/react';
import { ProductCard } from './ProductCard';
import Product from '@/app/entities/product/product';
import { BottomCartBar } from './BottomCartBar';
import { OrderControlView } from '../page';

interface MenuSectionProps {
    orderID: string;
    setView: (view: OrderControlView) => void;
}

export function MenuSection({ orderID, setView }: MenuSectionProps) {
    const { data: session } = useSession();
    const queryClient = useQueryClient();

    // Get current group item from cache (if adding to existing group)
    const currentGroupItem = queryClient.getQueryData<GroupItem | null>(['group-item', 'current']);

    // Fetch categories
    const { data: categories = [] } = useQuery({
        queryKey: ['categories', 'map', 'product'],
        queryFn: () => GetCategoriesMap(session!, true, false, false),
        enabled: !!session
    });

    // Fetch all products
    // Using existing fetching strategy from sales-nextjs
    const { data: productsResponse } = useQuery({
        queryKey: ['products', 'all'],
        queryFn: () => GetDefaultProducts(session!, 0, 100, true),
        enabled: !!session
    });

    const products = useMemo(() => productsResponse?.items || [], [productsResponse]);

    // Filter products based on current group item (same category and size)
    const filteredProducts = useMemo(() => {
        if (!products.length) return [];

        if (currentGroupItem?.category_id) {
            return products.filter(
                (product) =>
                    product.category_id === currentGroupItem.category_id &&
                    product.size?.name === currentGroupItem.size
            );
        }

        return products;
    }, [products, currentGroupItem]);

    // Group products by category
    const productsByCategory = useMemo(() => {
        const productsToGroup = filteredProducts;
        const grouped: Record<string, Product[]> = {};
        productsToGroup.forEach(product => {
            if (!grouped[product.category_id]) {
                grouped[product.category_id] = [];
            }
            grouped[product.category_id].push(product);
        });
        return grouped;
    }, [filteredProducts]);

    // Filter categories based on group item
    const visibleCategories = useMemo(() => {
        if (currentGroupItem?.category_id) {
            return categories.filter((c) => c.id === currentGroupItem.category_id);
        }
        return categories;
    }, [categories, currentGroupItem]);

    return (
        <div className='min-h-screen bg-gray-50 pb-24'>
            <div className='mx-auto max-w-4xl px-4 pt-5'>
                {/* Info Banner when filtering for group */}
                {currentGroupItem && (
                    <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex justify-between items-center'>
                        <div>
                            <span className='font-semibold'>ℹ️ Adicionando ao grupo</span>
                            <p className='mt-1'>
                                Mostrando apenas itens de {currentGroupItem.size || 'tamanho compatível'}.
                            </p>
                        </div>
                        <button
                            onClick={() => setView('cart')}
                            className='text-blue-600 hover:text-blue-800 underline font-medium'
                        >
                            Voltar
                        </button>
                    </div>
                )}

                {/* Categories Scroll */}
                {visibleCategories.length > 0 && (
                    <div className='sticky top-0 bg-gray-50 z-10 py-2 -mx-4 px-4 overflow-x-auto flex gap-2 no-scrollbar'>
                        {visibleCategories.map(c => (
                            <a
                                key={c.id}
                                href={`#cat-${c.id}`}
                                className='shrink-0 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap hover:bg-gray-50 hover:border-gray-300 transition-colors'
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById(`cat-${c.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                            >
                                {c.name}
                            </a>
                        ))}
                    </div>
                )}

                {/* Sections by Category */}
                <div className="space-y-8 mt-4">
                    {visibleCategories.map(category => {
                        const categoryProducts = productsByCategory[category.id] || [];
                        if (categoryProducts.length === 0) return null;

                        return (
                            <section key={category.id} id={`cat-${category.id}`} className='scroll-mt-24'>
                                <h3 className='text-xl font-bold mb-4 text-gray-800'>{category.name}</h3>
                                <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                                    {categoryProducts.map(p => (
                                        <ProductCard key={p.id} product={p} showQuickAdd={!!currentGroupItem} />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>

                {/* Loading state */}
                {visibleCategories.length === 0 && filteredProducts.length === 0 && (
                    <div className='mt-10 text-center text-gray-500'>
                        <p>Carregando cardápio...</p>
                    </div>
                )}

                {/* Empty state */}
                {visibleCategories.length > 0 && filteredProducts.length === 0 && (
                    <div className='mt-10 text-center text-gray-500'>
                        <p>Nenhum produto disponível no momento</p>
                    </div>
                )}
            </div>

            <BottomCartBar orderID={orderID} setView={setView} />
        </div>
    );
}
