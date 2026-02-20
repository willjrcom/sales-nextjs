import { useMemo, useState, useEffect } from "react";
import ProductCard from "../product/product-card";
import ListProducts from "../product/list-products";
import { TextField } from "../../../../../components/modal/field";
import GetProductBySKU from "@/app/api/product/sku/[sku]";
import { useSession } from "next-auth/react";
import RequestError from "@/app/utils/error";
import { notifyError } from "@/app/utils/notifications";
import { useModal } from "@/app/context/modal/context";
import AddProductCard from "@/app/forms/item/form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { GetDefaultProducts, GetDefaultProductsByCategory } from "@/app/api/product/product";
import { GetCategoriesMap } from "@/app/api/category/category";
import Refresh from "../../../../../components/crud/refresh";
import GroupItem from "@/app/entities/order/group-item";
import CartModal from "./cart-modal";
import { LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";
import ThreeColumnHeader from "@/components/header/three-column-header";

type ViewMode = 'grid' | 'list';

export const ListProductsToAdd = () => {
    const [searchSKU, setSearchSKU] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const { data } = useSession();
    const modalHandler = useModal();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const queryClient = useQueryClient();

    const groupItem = queryClient.getQueryData<GroupItem | null>(['group-item', 'current']);

    useEffect(() => {
        if (groupItem?.category_id) {
            setSelectedCategoryId(groupItem.category_id);
        }
    }, [groupItem?.category_id]);


    // Fetch categories for sidebar
    const { data: categories } = useQuery({
        queryKey: ['categories', 'default'],
        queryFn: () => GetCategoriesMap(data!, true, false, false),
        enabled: !!data?.user?.access_token,
    });

    // Fetch products based on selected category
    const { isPending, data: productsResponse, refetch } = useQuery({
        queryKey: ['products', 'default', selectedCategoryId, pagination.pageIndex, pagination.pageSize],
        queryFn: async () => {
            if (selectedCategoryId) {
                // Use category-specific endpoint
                const products = await GetDefaultProductsByCategory(data!, selectedCategoryId, false);
                return { items: products, headers: new Headers() };
            } else {
                // Use general endpoint
                return await GetDefaultProducts(data!, pagination.pageIndex, pagination.pageSize, true);
            }
        },
        enabled: !!data?.user?.access_token,
    });

    const products = useMemo(() => productsResponse?.items || [], [productsResponse?.items]);
    const totalCount = useMemo(() => {
        if (selectedCategoryId) {
            // When filtering by category, use the actual items length
            return products.length;
        }
        const count = productsResponse?.headers?.get('X-Total-Count');
        return count ? parseInt(count, 10) : 0;
    }, [productsResponse?.headers, selectedCategoryId, products.length]);
    const totalPages = useMemo(() => Math.ceil(totalCount / pagination.pageSize), [totalCount, pagination.pageSize]);

    const productsFiltered = useMemo(() => {
        if (!products.length) return [];

        if (groupItem?.category_id) {
            return products.filter((product) => product.category_id === groupItem.category_id && product.variations.some(v => v.size?.name === groupItem.size));
        }

        return products;
    }, [products, groupItem?.category_id, groupItem?.size]);

    const onSearch = async () => {
        if (!data) return

        try {
            const product = await GetProductBySKU(searchSKU, data);
            const modalName = `add-item-${product.id}`
            const onClose = () => {
                modalHandler.hideModal(modalName);
            }

            modalHandler.showModal(modalName, "", <AddProductCard product={product} />, "md", onClose)
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao buscar produto por codigo: " + searchSKU);
        }
    }

    const handlePreviousPage = () => {
        setPagination((prev) => ({
            ...prev,
            pageIndex: Math.max(0, prev.pageIndex - 1),
        }));
    };

    const handleNextPage = () => {
        setPagination((prev) => ({
            ...prev,
            pageIndex: Math.min(totalPages - 1, prev.pageIndex + 1),
        }));
    };

    const handleCategorySelect = (categoryId: string | null) => {
        setSelectedCategoryId(categoryId);
        setPagination({ pageIndex: 0, pageSize: 10 }); // Reset pagination when changing category
    };

    const startItem = pagination.pageIndex * pagination.pageSize + 1;
    const endItem = Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount);

    return (
        <div className="flex h-[75vh] overflow-hidden">
            {/* Category Sidebar */}
            <aside className="w-20 bg-white border-r border-gray-200 overflow-y-auto py-4 flex flex-col items-center gap-4 flex-shrink-0">
                {/* All Categories Button */}
                {!groupItem?.category_id && (
                    <button
                        onClick={() => handleCategorySelect(null)}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${selectedCategoryId === null
                            ? 'bg-blue-500/10 border-blue-500'
                            : 'bg-gray-100 border-transparent hover:border-gray-300'
                            }`}>
                            <LayoutGrid className={`h-5 w-5 ${selectedCategoryId === null ? 'text-blue-500' : 'text-gray-600'
                                }`} />
                        </div>
                        <span className={`text-[10px] font-bold uppercase ${selectedCategoryId === null ? 'text-blue-500' : 'text-gray-500'
                            }`}>
                            Todos
                        </span>
                    </button>
                )}

                {/* Category Buttons */}
                {categories?.filter(c => !groupItem?.category_id || c.id === groupItem.category_id).map((category) => (
                    <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${selectedCategoryId === category.id
                            ? 'bg-blue-500/10 border-blue-500'
                            : 'bg-gray-100 border-transparent hover:border-gray-300'
                            }`}>
                            <span className={`text-xl ${selectedCategoryId === category.id ? 'text-blue-500' : 'text-gray-600'
                                }`}>
                                {category.name.charAt(0)}
                            </span>
                        </div>
                        <span className={`text-[10px] font-medium uppercase text-center max-w-[70px] line-clamp-2 ${selectedCategoryId === category.id ? 'text-blue-500 font-bold' : 'text-gray-500'
                            }`}>
                            {category.name}
                        </span>
                    </button>
                ))}
            </aside>

            {/* Main Content */}
            <div className="flex-auto flex flex-col bg-gray-100 overflow-hidden">
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                    <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                            <TextField placeholder="Pesquisar por sku"
                                name="search"
                                setValue={setSearchSKU}
                                value={searchSKU}
                                key="search"
                                onEnter={onSearch}
                                optional
                            />
                            <Button onClick={onSearch} variant="outline">Buscar</Button>
                        </div>

                        <div className="flex items-center space-x-2">
                            <CartModal />

                            <Refresh
                                onRefresh={refetch}
                                isPending={isPending}
                            />
                        </div>
                    </div>

                    {groupItem?.category_id && <div className="text-xs text-gray-600 bg-white/70 border border-gray-200 rounded-md px-3 py-2 flex items-center gap-2">
                        <span aria-hidden="true">ℹ️</span>
                        <span title="Depois de escolher um item, o catálogo filtra os produtos para manter a mesma categoria e tamanho do grupo em edição.">
                            Ao selecionar um item, o catálogo mantém apenas produtos da mesma categoria e tamanho do grupo atual.
                        </span>
                    </div>}

                    {/* Grid View */}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {productsFiltered.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                            {productsFiltered.length === 0 && (
                                <div className="col-span-full text-center py-8 text-gray-500">
                                    Nenhum produto disponível
                                </div>
                            )}
                        </div>
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
                        <div className="space-y-2">
                            {productsFiltered.map((product) => (
                                <ListProducts key={product.id} product={product} />
                            ))}
                            {productsFiltered.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    Nenhum produto disponível
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalCount > 0 && (
                    <ThreeColumnHeader className="bg-white border-t px-4 py-3" left={
                        <div className="text-sm text-gray-700 gap-2">
                            Mostrando <span className="font-medium">{startItem}</span> a{" "}
                            <span className="font-medium">{endItem}</span> de{" "}
                            <span className="font-medium">{totalCount}</span> produtos
                        </div>
                    }

                        center={
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePreviousPage}
                                    disabled={pagination.pageIndex === 0 || isPending}
                                    className="gap-1"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Anterior
                                </Button>

                                <span className="text-sm text-gray-700">
                                    Página <span className="font-medium">{pagination.pageIndex + 1}</span> de{" "}
                                    <span className="font-medium">{totalPages}</span>
                                </span>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                    disabled={pagination.pageIndex >= totalPages - 1 || isPending}
                                    className="gap-1"
                                >
                                    Próxima
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        }
                        right={
                            <div className="flex items-center gap-1 bg-white border rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded transition-colors ${viewMode === 'grid'
                                        ? 'bg-blue-500 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    title="Visualização em grade"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded transition-colors ${viewMode === 'list'
                                        ? 'bg-blue-500 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    title="Visualização em lista"
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        }
                    />
                )}
            </div>
        </div>
    );
}
