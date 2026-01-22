import { useMemo, useState } from "react";
import ProductCard from "../product/card-product";
import ProductListItem from "../product/list-product";
import { TextField } from "../../modal/field";
import GetProductByCode from "@/app/api/product/code/[code]";
import { useSession } from "next-auth/react";
import RequestError from "@/app/utils/error";
import { notifyError } from "@/app/utils/notifications";
import { useModal } from "@/app/context/modal/context";
import AddProductCard from "@/app/forms/item/form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { GetDefaultProducts } from "@/app/api/product/product";
import Refresh from "../../crud/refresh";
import GroupItem from "@/app/entities/order/group-item";
import CartDrawerButton from "./cart-modal";
import { LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";

type ViewMode = 'grid' | 'list';

export const CartToAdd = () => {
    const [searchCode, setSearchCode] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const { data } = useSession();
    const modalHandler = useModal();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const queryClient = useQueryClient();

    const groupItem = queryClient.getQueryData<GroupItem | null>(['group-item', 'current']);

    const { isPending, data: productsResponse, refetch } = useQuery({
        queryKey: ['products', 'default', pagination.pageIndex, pagination.pageSize],
        queryFn: () => GetDefaultProducts(data!, pagination.pageIndex, pagination.pageSize, true),
        enabled: !!data?.user?.access_token,
    });

    const products = useMemo(() => productsResponse?.items || [], [productsResponse?.items]);
    const totalCount = useMemo(() => {
        const count = productsResponse?.headers?.get('X-Total-Count');
        return count ? parseInt(count, 10) : 0;
    }, [productsResponse?.headers]);
    const totalPages = useMemo(() => Math.ceil(totalCount / pagination.pageSize), [totalCount, pagination.pageSize]);

    const productsFiltered = useMemo(() => {
        if (!products.length) return [];

        if (groupItem?.category_id) {
            return products.filter((product) => product.category_id === groupItem.category_id && product.size?.name === groupItem.size);
        }

        return products;
    }, [products, groupItem?.category_id, groupItem?.size]);

    const onSearch = async () => {
        if (!data) return

        try {
            const product = await GetProductByCode(searchCode, data);
            const modalName = `add-item-${product.id}`
            const onClose = () => {
                modalHandler.hideModal(modalName);
            }

            modalHandler.showModal(modalName, "", <AddProductCard product={product} />, "md", onClose)
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao buscar produto por codigo: " + searchCode);
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

    const startItem = pagination.pageIndex * pagination.pageSize + 1;
    const endItem = Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount);

    return (
        <div className=" flex-auto p-4 bg-gray-100 space-y-3 mr-4 overflow-y-auto h-full">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <TextField placeholder="Pesquisar por codigo"
                        name="search"
                        setValue={setSearchCode}
                        value={searchCode}
                        friendlyName="Busca por codigo"
                        key="search"
                        onEnter={onSearch}
                        optional
                    />
                    <Button onClick={onSearch} variant="outline">Buscar</Button>
                </div>

                <div className="flex items-center space-x-2">
                    {/* View Toggle */}
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

                    <CartDrawerButton />

                    <Refresh
                        onRefresh={refetch}
                        isPending={isPending}
                    />
                </div>
            </div>

            <div className="text-xs text-gray-600 bg-white/70 border border-gray-200 rounded-md px-3 py-2 flex items-center gap-2">
                <span aria-hidden="true">ℹ️</span>
                <span title="Depois de escolher um item, o catálogo filtra os produtos para manter a mesma categoria e tamanho do grupo em edição.">
                    Ao selecionar um item, o catálogo mantém apenas produtos da mesma categoria e tamanho do grupo atual.
                </span>
            </div>

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
                        <ProductListItem key={product.id} product={product} />
                    ))}
                    {productsFiltered.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Nenhum produto disponível
                        </div>
                    )}
                </div>
            )}

            {/* Pagination Controls */}
            {totalCount > 0 && (
                <div className="flex items-center justify-between bg-white border rounded-lg px-4 py-3 mt-4">
                    <div className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{startItem}</span> a{" "}
                        <span className="font-medium">{endItem}</span> de{" "}
                        <span className="font-medium">{totalCount}</span> produtos
                    </div>

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
                </div>
            )}
        </div>
    );
}