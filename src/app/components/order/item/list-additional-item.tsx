import RequestError from '@/app/utils/error';
import DeleteAdditionalItem from '@/app/api/item/delete/additional/item';
import NewAdditionalItem from '@/app/api/item/update/additional/item';
import { useGroupItem } from '@/app/context/group-item/context';
import Decimal from 'decimal.js';
import Item from '@/app/entities/order/item';
import Product from '@/app/entities/product/product';
import { useSession } from 'next-auth/react';
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { notifyError } from '@/app/utils/notifications';
import { useQuery } from '@tanstack/react-query';
import GetCategories from '@/app/api/category/category';
import { GetAdditionalProducts } from '@/app/api/product/product';

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
    setItem: Dispatch<SetStateAction<Item>>
}

const convertProductToItem = (products: Product[], additionalItemsAdded: Item[]) => {
    const items: ItemAdditional[] = products?.map((product) => {
        const itemAdded = additionalItemsAdded.find(item => item.product_id === product.id)
        const item: ItemAdditional = {
            product_id: product.id,
            name: product.name,
            quantity: itemAdded?.quantity || 0,
            additional_item_id: itemAdded?.id || "",
            category_id: product.category_id,
            price: product.price,
        }
        return item
    })

    return items.sort((a, b) => a.name.localeCompare(b.name))
}

const AdditionalItemList = ({ item, setItem }: ItemListProps) => {
    const [additionalItemsToAdd, setAdditionalItemsToAdd] = useState<ItemAdditional[]>([]);
    const contextGroupItem = useGroupItem();
    const { data } = useSession();
    const isStaging = contextGroupItem.groupItem?.status === "Staging";

    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories'],
        queryFn: () => GetCategories(data!),
        enabled: !!data?.user?.access_token,
    });
    const { data: additionalProductsResponse } = useQuery({
        queryKey: ['additional-products', item.category_id],
        queryFn: () => GetAdditionalProducts(data!, item.category_id || ""),
        enabled: !!data?.user?.access_token,
        refetchInterval: 60 * 1000, // 60 seconds
    });

    const additionalItems = useMemo(() => additionalProductsResponse?.items || [], [additionalProductsResponse?.items]);
    const categories = useMemo(() => categoriesResponse?.items || [], [categoriesResponse?.items]);

    useEffect(() => {
        try {
            const items = convertProductToItem(additionalItems, item.additional_items || []);
            if (!items || items.length === 0) {
                return setAdditionalItemsToAdd([]);
            }

            setAdditionalItemsToAdd(items);
        } catch (error: RequestError | any) {
            notifyError(error);
        }
    }, [item.id, categories]);

    const updateAdditionalItem = async (clickedItem: ItemAdditional) => {
        if (!data) return

        const categoryFound = categories.find(c => c.id === clickedItem.category_id);
        if (!categoryFound) return notifyError("Categoria indisponivel")

        const quantityFound = categoryFound?.quantities.find(quantity => quantity.quantity === clickedItem.quantity)
        if (!quantityFound) return notifyError("Quantidade indisponivel")

        try {
            clickedItem.additional_item_id = await NewAdditionalItem(item.id, { product_id: clickedItem.product_id, quantity_id: quantityFound?.id }, data)
        } catch (error: RequestError | any) {
            notifyError(error)
        }

        // Update additional items to add
        const newAdditionalItemsToAdd = additionalItemsToAdd?.filter(item => item.product_id !== clickedItem.product_id) || [];
        newAdditionalItemsToAdd.push({ ...clickedItem, additional_item_id: clickedItem.additional_item_id });

        setAdditionalItemsToAdd(newAdditionalItemsToAdd.sort((a, b) => a.name.localeCompare(b.name)));
    }

    const handleIncrement = (clickedItem: ItemAdditional) => {
        if (clickedItem.quantity === 5) return notifyError("Maximo de 5 itens adicionais")

        clickedItem.quantity += 1

        updateAdditionalItem(clickedItem)

        // Update additional item from Item
        const newAdditionalItems = item.additional_items?.filter(i => i.product_id !== clickedItem.product_id) || [];
        newAdditionalItems.push({ ...clickedItem, id: clickedItem.additional_item_id } as Item);

        setItem((prev) => ({
            ...prev,
            total_price: new Decimal(prev.total_price).plus(new Decimal(clickedItem.price)),
            additional_items: newAdditionalItems
        }))
    };

    const handleDecrement = async (clickedItem: ItemAdditional) => {
        if (clickedItem.quantity === 0 || !data) return notifyError("Quantidade mínima atingida")

        // Decrementa quantidade localmente
        clickedItem.quantity -= 1

        // Se ainda restar quantidade, apenas atualiza
        if (clickedItem.quantity !== 0) {
            updateAdditionalItem(clickedItem)

            // Atualiza lista de adicionais no item, mantendo a nova quantidade
            const newAdditionalItems = item.additional_items?.filter(i => i.product_id !== clickedItem.product_id) || [];
            newAdditionalItems.push({ ...clickedItem, id: clickedItem.additional_item_id } as Item);

            setItem((prev) => ({
                ...prev,
                total_price: new Decimal(prev.total_price).minus(new Decimal(clickedItem.price)),
                additional_items: newAdditionalItems
            }))

            return
        }

        if (!clickedItem.additional_item_id) return notifyError("Item indisponivel")

        // Delete additional item
        try {
            await DeleteAdditionalItem(clickedItem.additional_item_id, data)
        } catch (error: RequestError | any) {
            notifyError(error)
        }

        // Update additional item from Item
        const newAdditionalItems = item.additional_items?.filter(i => i.product_id !== clickedItem.product_id) || [];

        setItem((prev) => ({
            ...prev,
            total_price: new Decimal(prev.total_price).minus(new Decimal(clickedItem.price)),
            additional_items: newAdditionalItems
        }))
    };

    const AdditionalItemCard = ({ item }: { item: ItemAdditional }) => {
        let name = item.name;

        if (isStaging) {
            name += "- R$" + new Decimal(item.price).toFixed(2)
        }
        return (
            <div key={item.product_id} className="flex items-center space-x-4">
                <div className="flex-1">{name} </div>
                <div className="flex items-center space-x-2">
                    {isStaging &&
                        <button
                            onClick={() => handleDecrement(item)}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                            -
                        </button>}
                    <span>{item.quantity}</span>

                    {isStaging &&
                        <button
                            onClick={() => handleIncrement(item)}
                            className="bg-green-500 text-white px-3 py-1 rounded"
                        >
                            +
                        </button>}
                </div>
            </div>
        );
    }
    return (
        <div>
            <br className="my-4" />
            <h4 className="text-2md font-bold">Itens adicionais</h4>
            <hr className='my-4' />
            <div className="space-y-4">
                {additionalItemsToAdd?.map((item) => <AdditionalItemCard key={item.product_id} item={item} />)}
                {additionalItemsToAdd.length === 0 && <p className="text-gray-500">Nenhum item disponível</p>}
            </div>
        </div>
    );
};

export default AdditionalItemList;
