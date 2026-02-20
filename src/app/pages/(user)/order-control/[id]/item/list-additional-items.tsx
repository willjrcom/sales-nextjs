import RequestError from '@/app/utils/error';
import Refresh, { FormatRefreshTime } from '@/app/components/crud/refresh';
import DeleteAdditionalItem from '@/app/api/item/delete/additional/item';
import NewAdditionalItem from '@/app/api/item/update/additional/item';
import Decimal from 'decimal.js';
import Item from '@/app/entities/order/item';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { notifyError } from '@/app/utils/notifications';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GetAdditionalProducts } from '@/app/api/product/product';
import GroupItem from '@/app/entities/order/group-item';
import Product from '@/app/entities/product/product';
import GetGroupItemByID from '@/app/api/group-item/[id]/group-item';

interface ListAdditionalItemsProps {
    item: Item;
}

interface QuantityMapItem {
    additional_item_id: string;
    quantity: number;
}

const ListAdditionalItems = ({ item }: ListAdditionalItemsProps) => {
    const { data } = useSession();
    const queryClient = useQueryClient();
    const groupItem = queryClient.getQueryData<GroupItem | null>(['group-item', 'current']);
    const isStaging = groupItem?.status === "Staging";
    const [lastUpdate, setLastUpdate] = useState("");
    const [quantities, setQuantities] = useState<Record<string, QuantityMapItem>>({});

    // Fetch additional products
    const { data: additionalProductsResponse, refetch, isRefetching, isLoading, error } = useQuery({
        queryKey: ['additional-products', item.category_id],
        queryFn: async () => {
            const result = await GetAdditionalProducts(data!, item.category_id);
            setLastUpdate(FormatRefreshTime(new Date()));
            return result;
        },
        enabled: !!data?.user?.access_token && !!item.category_id,
        refetchInterval: 60 * 1000,
        staleTime: 30 * 1000,
    });

    const additionalProducts: Product[] = useMemo(() => {
        return additionalProductsResponse?.items || [];
    }, [additionalProductsResponse]);

    // Sync quantities map
    useEffect(() => {
        const map: Record<string, QuantityMapItem> = {};

        (item.additional_items || []).forEach((i) => {
            map[i.product_id] = {
                additional_item_id: i.id,
                quantity: i.quantity || 0,
            };
        });

        additionalProducts.forEach((p) => {
            if (!map[p.id]) {
                map[p.id] = { additional_item_id: "", quantity: 0 };
            }
        });

        setQuantities(map);
    }, [item.additional_items, additionalProducts]);

    // Add / update additional item
    const addMutation = useMutation({
        mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) =>
            NewAdditionalItem(item.id, { product_id: productId, quantity }, data!),
        onSuccess: async (additionalItemId, variables) => {
            if (groupItem && data) {
                const updatedGroupItem = await GetGroupItemByID(groupItem.id, data);
                queryClient.setQueryData(['group-item', 'current'], updatedGroupItem);
            }
            setQuantities(prev => ({
                ...prev,
                [variables.productId]: {
                    additional_item_id: additionalItemId,
                    quantity: variables.quantity,
                },
            }));
        },
        onError: (error: RequestError | any) =>
            notifyError(error.message || 'Erro ao adicionar item'),
    });

    // Remove additional item
    const removeMutation = useMutation({
        mutationFn: async ({ additionalItemId }: { additionalItemId: string, productId: string }) =>
            DeleteAdditionalItem(additionalItemId, data!),
        onSuccess: async (_, variables) => {
            if (groupItem && data) {
                const updatedGroupItem = await GetGroupItemByID(groupItem.id, data);
                queryClient.setQueryData(['group-item', 'current'], updatedGroupItem);
            }
            setQuantities(prev => ({
                ...prev,
                [variables.productId]: {
                    additional_item_id: "",
                    quantity: 0,
                },
            }));
        },
        onError: (error: RequestError | any) =>
            notifyError(error.message || 'Erro ao remover item'),
    });

    const handleIncrement = (product: Product) => {
        const current = quantities[product.id]?.quantity ?? 0;
        if (current >= 5) return notifyError("Máximo de 5 itens adicionais");

        addMutation.mutate({ productId: product.id, quantity: current + 1 });
    };

    const handleDecrement = (product: Product) => {
        const current = quantities[product.id]?.quantity ?? 0;
        if (current === 0) return notifyError("Quantidade mínima atingida");

        const newQuantity = current - 1;

        if (newQuantity === 0) {
            const additionalId = quantities[product.id]?.additional_item_id;
            if (!additionalId) return notifyError("Item indisponível");

            removeMutation.mutate({
                additionalItemId: additionalId,
                productId: product.id,
            });
        } else {
            addMutation.mutate({ productId: product.id, quantity: newQuantity });
        }
    };

    const AdditionalItemCard = ({ product }: { product: Product }) => {
        const isUpdating = addMutation.isPending || removeMutation.isPending;
        const qty = quantities[product.id]?.quantity ?? 0;

        let name = product.name;
        if (isStaging && product.variations?.length > 0) {
            const minPrice = Math.min(...product.variations.map(v => new Decimal(v.price).toNumber()));
            name += " - R$" + new Decimal(minPrice).toFixed(2);
        }

        return (
            <div className="flex items-center space-x-4">
                <div className="flex-1">{name}</div>
                <div className="flex items-center space-x-2">
                    {isStaging && (
                        <button
                            onClick={() => handleDecrement(product)}
                            disabled={isUpdating}
                            className="bg-red-500 text-white px-3 py-1 rounded disabled:opacity-50 hover:bg-red-600"
                        >
                            -
                        </button>
                    )}
                    <span className="min-w-[20px] text-center">{qty}</span>
                    {isStaging && (
                        <button
                            onClick={() => handleIncrement(product)}
                            disabled={isUpdating}
                            className="bg-green-500 text-white px-3 py-1 rounded disabled:opacity-50 hover:bg-green-600"
                        >
                            +
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            <br className="my-4" />
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-2md font-bold">Itens adicionais</h4>
                <Refresh onRefresh={refetch} isPending={isRefetching} lastUpdate={lastUpdate} />
            </div>
            <hr className='my-4' />

            {isLoading && <p className="text-gray-500">Carregando itens adicionais...</p>}
            {error && <p className="text-red-600">Erro ao carregar itens adicionais.</p>}

            {!isLoading && !error && (
                <div className="space-y-4">
                    {additionalProducts.map(product => (
                        <AdditionalItemCard key={product.id} product={product} />
                    ))}
                    {additionalProducts.length === 0 && (
                        <p className="text-gray-500">Nenhum item disponível</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ListAdditionalItems;
