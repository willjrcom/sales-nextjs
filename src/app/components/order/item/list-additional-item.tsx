import RequestError from '@/app/api/error';
import DeleteAdditionalItem from '@/app/api/item/delete/additional/item';
import NewAdditionalItem from '@/app/api/item/update/additional/item';
import { useGroupItem } from '@/app/context/group-item/context';
import Item from '@/app/entities/order/item';
import Product from '@/app/entities/product/product';
import { RootState } from '@/redux/store';
import { useSession } from 'next-auth/react';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface ItemAdditional {
    name: string;
    quantity: number;
    category_id: string;
    product_id: string;
    additional_item_id?: string;
    price: number;
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
    const [additionalItemsToAdd, setAdditionalItems] = useState<ItemAdditional[]>([]);
    const [error, setError] = useState<RequestError | null>(null);
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const contextGroupItem = useGroupItem();
    const { data } = useSession();
    const isStaging = contextGroupItem.groupItem?.status === "Staging";

    useEffect(() => {
        try {
            // Passo 1: Buscar a categoria atual do item
            const category = categoriesSlice.entities[item.category_id];
            if (!category) {
                return setAdditionalItems([]); // Caso não encontre a categoria, retorna lista vazia
            }

            // Passo 2: Buscar as categorias adicionais relacionadas à categoria do item
            const additionalCategories = category.additional_categories;
            if (!additionalCategories || additionalCategories.length === 0) {
                return setAdditionalItems([]); // Se não houver categorias adicionais, retorna lista vazia
            }

            // Passo 3: Buscar os produtos disponíveis em cada categoria adicional
            const productsFound = additionalCategories
                .map((additionalCategory) => categoriesSlice.entities[additionalCategory.id]?.products) // Obter os produtos de cada categoria adicional
                .flat().filter(item => item != null && item !== undefined); // "Flatten" para uma lista única de produtos

            if (!productsFound || productsFound.length === 0) {
                return setAdditionalItems([]); // Se não houver produtos, retorna lista vazia
            }

            // Passo 5: Converter os produtos válidos para itens
            const items = convertProductToItem(productsFound, item.additional_items || []);
            // Passo 6: Verificar se após conversão existem itens válidos
            if (!items || items.length === 0) {
                return setAdditionalItems([]); // Se não houver itens válidos após a conversão, retorna lista vazia
            }

            // Atualiza o estado com os itens convertidos
            setAdditionalItems(items);

        } catch (error) {
            setError(error as RequestError);
        }
    }, [item.id]);

    const updateAdditionalItem = async (clickedItem: ItemAdditional) => {
        if (!data) return

        const categoryFound = categoriesSlice.entities[clickedItem.category_id]
        if (!categoryFound) return setError(new RequestError("Categoria indisponivel"))

        const quantityFound = categoryFound?.quantities.find(quantity => quantity.quantity === clickedItem.quantity)
        if (!quantityFound) return setError(new RequestError("Quantidade indisponivel"))

        try {
            clickedItem.additional_item_id = await NewAdditionalItem(item.id, { product_id: clickedItem.product_id, quantity_id: quantityFound?.id }, data)
            setError(null)
        } catch (error) {
            setError(error as RequestError)
        }

        // Update additional items to add
        const newAdditionalItemsToAdd = additionalItemsToAdd?.filter(item => item.product_id !== clickedItem.product_id) || [];
        newAdditionalItemsToAdd.push({ ...clickedItem, additional_item_id: clickedItem.additional_item_id });

        setAdditionalItems(newAdditionalItemsToAdd.sort((a, b) => a.name.localeCompare(b.name)));
    }

    const handleIncrement = (clickedItem: ItemAdditional) => {
        if (clickedItem.quantity === 5) return setError(new RequestError("Maximo de 5 itens adicionais"))

        clickedItem.quantity += 1

        updateAdditionalItem(clickedItem)

        // Update additional item from Item
        const newAdditionalItems = item.additional_items?.filter(item => item.product_id !== clickedItem.product_id) || [];
        newAdditionalItems.push({ ...clickedItem, id: clickedItem.additional_item_id } as Item);

        setItem((prev) => ({
            ...prev,
            total_price: prev.total_price + clickedItem.price,
            additional_items: newAdditionalItems
        }))
    };

    const handleDecrement = async (clickedItem: ItemAdditional) => {
        if (clickedItem.quantity === 0 || !data) return setError(new RequestError("Minimo de 5 itens adicionais"))

        clickedItem.quantity -= 1

        // Update quantity
        if (clickedItem.quantity !== 0) {
            updateAdditionalItem(clickedItem)

            // Update additional item from Item
            const newAdditionalItems = item.additional_items?.filter(item => item.product_id !== clickedItem.product_id) || [];

            setItem((prev) => ({
                ...prev,
                total_price: prev.total_price - clickedItem.price,
                additional_items: newAdditionalItems
            }))

            return
        }

        if (!clickedItem.additional_item_id) return setError(new RequestError("Item indisponivel"))

        // Delete additional item
        try {
            await DeleteAdditionalItem(clickedItem.additional_item_id, data)
            setError(null)
        } catch (error) {
            setError(error as RequestError)
        }

        // Update additional item from Item
        const newAdditionalItems = item.additional_items?.filter(item => item.product_id !== clickedItem.product_id) || [];

        setItem((prev) => ({
            ...prev,
            total_price: prev.total_price - clickedItem.price,
            additional_items: newAdditionalItems
        }))
    };

    const AdditionalItemCard = ({ item }: { item: ItemAdditional }) => {
        let name = item.name;

        if (isStaging) {
            name += "- R$" + item.price.toFixed(2)
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
            {error && <p className="text-red-500 mb-4">{error.message}</p>}
            <div className="space-y-4">
                {additionalItemsToAdd?.map((item) => <AdditionalItemCard key={item.product_id} item={item} />)}
                {additionalItemsToAdd.length === 0 && <p className="text-gray-500">Nenhum item disponível</p>}
            </div>
        </div>
    );
};

export default AdditionalItemList;
