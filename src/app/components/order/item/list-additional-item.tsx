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

interface ItemAdditional {
    name: string;
    quantity: number;
    category_id: string;
    product_id: string;
    additional_item_id?: string;
    price: Decimal;
}

interface ItemListProps {
    item: Item;
}

const AdditionalItemList = ({ item }: ItemListProps) => {
    const { data } = useSession();
    const queryClient = useQueryClient();
    const groupItem = queryClient.getQueryData<GroupItem | null>(['group-item', 'current']);
    const isStaging = groupItem?.status === "Staging";
    const [lastUpdate, setLastUpdate] = useState<string>("");
    const [localAdditionalItems, setLocalAdditionalItems] = useState<Item[]>(item.additional_items || []);

    // Sync local state with props
    useEffect(() => {
        setLocalAdditionalItems(item.additional_items || []);
    }, [item.additional_items]);

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

    // Derive additional items from products and current item state (no duplicate state!)
    const additionalItemsToDisplay = useMemo(() => {
        const products = additionalProductsResponse?.items || [];

        const items: ItemAdditional[] = products.map((product) => {
            const itemAdded = localAdditionalItems.find(i => i.product_id === product.id);
            return {
                product_id: product.id,
                name: product.name,
                quantity: itemAdded?.quantity || 0,
                additional_item_id: itemAdded?.id || "",
                category_id: product.category_id,
                price: product.price,
            };
        });

        return items.sort((a, b) => a.name.localeCompare(b.name));
    }, [additionalProductsResponse?.items, localAdditionalItems]);

    // Mutation for adding/updating additional item
    const addMutation = useMutation({
        mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
            return await NewAdditionalItem(item.id, { product_id: productId, quantity }, data!);
        },
        onSuccess: (additionalItemId, variables) => {
            // Update local state immediately for UI feedback
            setLocalAdditionalItems((prev) => {
                const filtered = prev.filter(i => i.product_id !== variables.productId);
                const clickedItem = additionalItemsToDisplay.find(i => i.product_id === variables.productId);
                if (clickedItem) {
                    filtered.push({
                        ...clickedItem,
                        id: additionalItemId,
                        quantity: variables.quantity,
                    } as Item);
                }
                return filtered;
            });


        },
        onError: (error: RequestError | any) => {
            notifyError(error.message || 'Erro ao adicionar item');
        },
    });

    // Mutation for removing additional item
    const removeMutation = useMutation({
        mutationFn: async ({ additionalItemId, productId }: { additionalItemId: string; productId: string }) => {
            await DeleteAdditionalItem(additionalItemId, data!);
            return productId;
        },
        onSuccess: (productId) => {
            // Update local state immediately for UI feedback
            setLocalAdditionalItems((prev) => prev.filter(i => i.product_id !== productId));


        },
        onError: (error: RequestError | any) => {
            notifyError(error.message || 'Erro ao remover item');
        },
    });

    // Mutation for updating quantity (decrement without deleting)
    const updateMutation = useMutation({
        mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
            return await NewAdditionalItem(item.id, { product_id: productId, quantity }, data!);
        },
        onSuccess: (additionalItemId, variables) => {
            // Update local state immediately for UI feedback
            setLocalAdditionalItems((prev) => {
                const filtered = prev.filter(i => i.product_id !== variables.productId);
                const clickedItem = additionalItemsToDisplay.find(i => i.product_id === variables.productId);
                if (clickedItem) {
                    filtered.push({
                        ...clickedItem,
                        id: additionalItemId,
                        quantity: variables.quantity,
                    } as Item);
                }
                return filtered;
            });


        },
        onError: (error: RequestError | any) => {
            notifyError(error.message || 'Erro ao atualizar item');
        },
    });

    const handleIncrement = (clickedItem: ItemAdditional) => {
        if (clickedItem.quantity >= 5) {
            return notifyError("Máximo de 5 itens adicionais");
        }

        addMutation.mutate({
            productId: clickedItem.product_id,
            quantity: clickedItem.quantity + 1,
        });
    };

    const handleDecrement = (clickedItem: ItemAdditional) => {
        if (clickedItem.quantity === 0) {
            return notifyError("Quantidade mínima atingida");
        }

        const newQuantity = clickedItem.quantity - 1;

        if (newQuantity === 0) {
            if (!clickedItem.additional_item_id) {
                return notifyError("Item indisponível");
            }
            removeMutation.mutate({
                additionalItemId: clickedItem.additional_item_id,
                productId: clickedItem.product_id,
            });
        } else {
            updateMutation.mutate({
                productId: clickedItem.product_id,
                quantity: newQuantity,
            });
        }
    };

    const AdditionalItemCard = ({ item: cardItem }: { item: ItemAdditional }) => {
        const isUpdating = addMutation.isPending || removeMutation.isPending || updateMutation.isPending;

        let name = cardItem.name;
        if (isStaging) {
            name += " - R$" + new Decimal(cardItem.price).toFixed(2);
        }

        return (
            <div key={cardItem.product_id} className="flex items-center space-x-4">
                <div className="flex-1">{name}</div>
                <div className="flex items-center space-x-2">
                    {isStaging && (
                        <button
                            onClick={() => handleDecrement(cardItem)}
                            disabled={isUpdating}
                            className="bg-red-500 text-white px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition"
                        >
                            -
                        </button>
                    )}
                    <span className="min-w-[20px] text-center">{cardItem.quantity}</span>
                    {isStaging && (
                        <button
                            onClick={() => handleIncrement(cardItem)}
                            disabled={isUpdating}
                            className="bg-green-500 text-white px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition"
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

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-3 text-gray-600">Carregando itens adicionais...</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    Erro ao carregar itens adicionais. Tente novamente.
                </div>
            )}

            {/* Content */}
            {!isLoading && !error && (
                <div className="space-y-4">
                    {additionalItemsToDisplay.map((item) => (
                        <AdditionalItemCard key={item.product_id} item={item} />
                    ))}
                    {additionalItemsToDisplay.length === 0 && (
                        <p className="text-gray-500">Nenhum item disponível</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdditionalItemList;
