import { useMemo, useState, useEffect, useRef } from 'react';
import { GetDefaultProducts } from '@/app/api/product/product';
import GroupItem from '@/app/entities/order/group-item';
import { useSession } from 'next-auth/react';
import { ProductCard } from './ProductCard';
import Product from '@/app/entities/product/product';
import Refresh from "@/app/components/crud/refresh";
import { TextField } from "@/app/components/modal/field";
import { Button } from "@/components/ui/button";
import GetProductBySKU from "@/app/api/product/sku/[sku]";
import { useModal } from "@/app/context/modal/context";
import AddProductCard from "@/app/forms/item/form";
import RequestError from "@/app/utils/error";
import { notifyError } from "@/app/utils/notifications";
import { FaSearch } from 'react-icons/fa';
import { OrderControlView } from '../page';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GetCategoriesMap } from '@/app/api/category/category';
import { BottomCartBar } from './BottomCartBar';

interface MenuSectionProps {
    orderID: string;
    setView: (view: OrderControlView) => void;
}

export function MenuSection({ orderID, setView }: MenuSectionProps) {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const modalHandler = useModal();
    const [searchSKU, setSearchSKU] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Get current group item from cache (if adding to existing group)
    const currentGroupItem = queryClient.getQueryData<GroupItem | null>(['group-item', 'current']);

    const onSearch = async () => {
        if (!session) return

        try {
            const product = await GetProductBySKU(searchSKU, session);
            const modalName = `add-item-${product.id}`
            const onClose = () => {
                modalHandler.hideModal(modalName);
            }

            modalHandler.showModal(modalName, "", <AddProductCard product={product} />, "md", onClose)
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao buscar produto por codigo: " + searchSKU);
        } finally {
            setSearchSKU('');
            setIsSearching(false);
        }
    }

    // Keyboard shortcut for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only trigger if not already typing in an input text area
            const activeElement = document.activeElement;
            const isInputActive = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';

            if (e.key === 'b' && !isInputActive) {
                e.preventDefault();
                setIsSearching(true);
            }
            if (e.key === 'Escape' && isSearching) {
                setIsSearching(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSearching]);

    useEffect(() => {
        if (isSearching && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearching]);

    // Fetch categories
    const { isLoading: categoriesLoading, isFetching: categoriesFetching, data: categories = [], refetch: refetchCategories } = useQuery({
        queryKey: ['categories', 'map', 'order'],
        queryFn: () => GetCategoriesMap(session!, true, false, false),
        enabled: !!session
    });

    // Fetch all products
    // Using existing fetching strategy from sales-nextjs
    const { isLoading: productsLoading, isFetching: productsFetching, data: productsResponse, refetch: refetchProducts } = useQuery({
        queryKey: ['products', 'all'],
        queryFn: () => GetDefaultProducts(session!, 0, 100, true),
        enabled: !!session
    });

    const isLoading = categoriesLoading || productsLoading;
    const isFetching = categoriesFetching || productsFetching;

    const products = useMemo(() => productsResponse?.items || [], [productsResponse]);

    // Filter products based on current group item (same category and size)
    const filteredProducts = useMemo(() => {
        if (!products.length) return [];

        if (currentGroupItem?.category_id) {
            return products.filter(
                (product) =>
                    product.category_id === currentGroupItem.category_id &&
                    product.variations.some(v => v.size?.name === currentGroupItem.size)
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
            const filtered = categories.filter((c) => c.id === currentGroupItem.category_id);
            // If we have a filter but it yields no results from a loaded list, we might have a data mismatch
            if (filtered.length === 0 && categories.length > 0) return categories;
            return filtered;
        }
        return categories;
    }, [categories, currentGroupItem]);

    const handleClearFilter = () => {
        queryClient.setQueryData(['group-item', 'current'], null);
    };

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
                            onClick={() => {
                                handleClearFilter();
                                setView('cart');
                            }}
                            className='text-blue-600 hover:text-blue-800 underline font-medium'
                        >
                            Limpar e Voltar
                        </button>
                    </div>
                )}

                {/* Categories Scroll and Search */}
                {visibleCategories.length > 0 && (
                    <div className='sticky top-0 bg-gray-50 z-10 py-2 -mx-4 px-4 flex justify-between items-center gap-2'>
                        {isSearching ? (
                            <div className="flex w-full items-center gap-2 bg-white px-2 rounded-full border border-gray-300 shadow-sm animate-in fade-in slide-in-from-right-2 duration-200">

                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    className="flex-1 bg-transparent py-2 px-1 text-sm outline-none placeholder:text-gray-400"
                                    placeholder="Buscar por código ou SKU... (Atalho: B)"
                                    value={searchSKU}
                                    onChange={(e) => setSearchSKU(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            onSearch();
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => setIsSearching(false)}
                                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <div className='overflow-x-auto flex gap-2 no-scrollbar w-full'>
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
                        <div className='shrink-0 flex items-center gap-1'>
                            {!isSearching && (
                                <button
                                    onClick={() => setIsSearching(true)}
                                    title="Buscar Código (Atalho: B)"
                                    className="p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors flex items-center justify-center h-10 w-10"
                                >
                                    <FaSearch size={18} />
                                </button>
                            )}
                            <Refresh
                                onRefresh={() => {
                                    refetchCategories();
                                    refetchProducts();
                                }}
                                isFetching={isFetching}
                            />
                        </div>
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
                                        <ProductCard key={p.id} product={p} showQuickAdd={!!currentGroupItem} setView={setView} />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>

                {/* Loading state */}
                {isLoading && (
                    <div className='mt-10 text-center text-gray-500'>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p>Carregando cardápio...</p>
                    </div>
                )}

                {/* Empty state (No products at all) */}
                {!isLoading && products.length === 0 && (
                    <div className='mt-10 text-center text-gray-500'>
                        <p>Nenhum produto disponível no momento</p>
                    </div>
                )}

                {/* Filtered Empty state (Products exist but none match filter) */}
                {!isLoading && products.length > 0 && filteredProducts.length === 0 && (
                    <div className='mt-10 text-center text-gray-500'>
                        <p className="mb-4">Nenhum item compatível com {currentGroupItem?.size || 'os filtros'} foi encontrado.</p>
                        <button
                            onClick={handleClearFilter}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                        >
                            Ver todos os produtos
                        </button>
                    </div>
                )}
            </div>

            <BottomCartBar orderID={orderID} setView={setView} />
        </div>
    );
}
