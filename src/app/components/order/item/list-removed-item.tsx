import RequestError from '@/app/api/error';
import AddRemovedItem from '@/app/api/item/update/removed-item/add/route';
import RemoveRemovedItem from '@/app/api/item/update/removed-item/remove/route';
import Item from '@/app/entities/order/item';
import { RootState } from '@/redux/store';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface ItemListProps {
    item: Item;
}

const RemovedItemList = ({ item }: ItemListProps) => {
    const [removableItems, setRemovableItems] = useState<string[]>([]);
    const [error, setError] = useState<RequestError | null>(null);
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const { data } = useSession();

    useEffect(() => {
        try {
            // Passo 1: Buscar a categoria atual do item
            const category = categoriesSlice.entities[item.category_id];
            if (!category) {
                return setRemovableItems([]); // Caso não encontre a categoria, retorna lista vazia
            }
            // Atualiza o estado com os itens convertidos
            setRemovableItems(category.removable_ingredients);

        } catch (error) {
            setError(error as RequestError);
        }
    }, [item.id]);

    const addRemovedItem = async (name: string) => {
        if (!data) return;
        
        try {
            await AddRemovedItem(item.id, name, data);
            item.removed_items?.push(name);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    const removeRemovedItem = async (name: string) => {
        if (!data) return;

        try {
            await RemoveRemovedItem(item.id, name, data);
            item.removed_items?.splice(item.removed_items.indexOf(name), 1);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    return (
        <div>
            <br className="my-4" />
            <h4 className="text-2md font-bold">Itens a remover</h4>
            <hr className='my-4' />
            {error && <p className="text-red-500 mb-4">{error.message}</p>}
            <div className="space-y-4">
                {removableItems?.map((removableItem) => {
                    const isRemoved = item.removed_items?.includes(removableItem)
                    const disabledClass = isRemoved ? "bg-gray-300" : "";

                    return (
                        <div key={removableItem} 
                        className={disabledClass + ` flex items-center space-x-4 p-2 rounded`}>
                            <div className="flex-1">
                                {removableItem}
                            </div>
                            <div className="flex items-center space-x-2">
                                {isRemoved &&
                                    <button
                                        onClick={() => removeRemovedItem(removableItem)}
                                        className="bg-green-500 text-white px-3 py-1 rounded"
                                    >
                                        Adicionar
                                    </button>}
                                {!isRemoved && <button
                                    onClick={() => addRemovedItem(removableItem)}
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                >
                                    Remover
                                </button>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default RemovedItemList;
