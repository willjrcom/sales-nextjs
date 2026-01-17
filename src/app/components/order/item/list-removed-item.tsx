import RequestError from '@/app/utils/error';
import AddRemovedItem from '@/app/api/item/update/removed-item/add/item';
import RemoveRemovedItem from '@/app/api/item/update/removed-item/remove/item';
import { useGroupItem } from '@/app/context/group-item/context';
import Item from '@/app/entities/order/item';
import { useSession } from 'next-auth/react';
import React, { useMemo, useState } from 'react';
import { notifyError } from '@/app/utils/notifications';
import { useQuery } from '@tanstack/react-query';
import GetCategories from '@/app/api/category/category';

interface ItemListProps {
    item: Item;
}

const RemovedItemList = ({ item }: ItemListProps) => {
    const [removedItems, setRemovedItems] = useState<string[]>(item.removed_items || []);
    const contextGroupItem = useGroupItem();
    const { data } = useSession();
    const isStaging = contextGroupItem.groupItem?.status === "Staging";

    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories'],
        queryFn: () => GetCategories(data!),
        enabled: !!data?.user?.access_token,
    });

    const categories = useMemo(() => categoriesResponse?.items || [], [categoriesResponse?.items]);
    const category = useMemo(() => categories.find(c => c.id === item.category_id), [categories, item.category_id]);
    const removableItems = useMemo(() => category?.removable_ingredients || [], [category]);

    const addRemovedItem = async (name: string) => {
        if (!data) return;

        try {
            await AddRemovedItem(item.id, name, data);
            setRemovedItems((prev) => [...prev, name]); // Adiciona o item ao estado local
        } catch (error: RequestError | any) {
            notifyError(error);
        }
    };

    const removeRemovedItem = async (name: string) => {
        if (!data) return;

        try {
            await RemoveRemovedItem(item.id, name, data);
            setRemovedItems((prev) => prev.filter((item) => item !== name)); // Remove o item do estado local
        } catch (error: RequestError | any) {
            notifyError(error);
        }
    };

    const RemovedItemCard = ({ item }: { item: string }) => {
        const isRemoved = removedItems.includes(item);
        const disabledClass = isRemoved ? "bg-red-300" : "";

        return (
            <div key={item}
                className={disabledClass + ` flex items-center space-x-4 p-2 rounded`}>
                <div className="flex-1">
                    {item}
                </div>
                {isStaging && <div className="flex items-center space-x-2">
                    {isRemoved ? (
                        <button
                            onClick={() => removeRemovedItem(item)}
                            className="bg-green-500 text-white px-3 py-1 rounded"
                        >
                            Adicionar
                        </button>
                    ) : (
                        <button
                            onClick={() => addRemovedItem(item)}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                            Remover
                        </button>
                    )}
                </div>}
            </div>
        );
    }
    return (
        <div>
            <br className="my-4" />
            <h4 className="text-2md font-bold">Itens a remover</h4>
            <hr className='my-4' />
            <div className="space-y-4">
                {removableItems?.map((removableItem) => <RemovedItemCard key={removableItem} item={removableItem} />)}
                {(!removableItems || removableItems?.length === 0) && <p className="text-gray-500">Nenhum item disponível</p>}
            </div>
        </div>
    );
};

export default RemovedItemList;
