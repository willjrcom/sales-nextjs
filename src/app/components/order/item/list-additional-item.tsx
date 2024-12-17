import RequestError from '@/app/api/error';
import DeleteAdditionalItem from '@/app/api/item/delete/additional/route';
import NewAdditionalItem from '@/app/api/item/update/additional/route';
import Item from '@/app/entities/order/item';
import Product from '@/app/entities/product/product';
import { RootState } from '@/redux/store';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface ItemAdditional {
    name: string;
    quantity: number;
    category_id: string;
    product_id: string;
    additional_item_id?: string
}

interface ItemListProps {
    item: Item;
}

const convertProductToItem = (products: Product[], additionalItemsAdded: Item[]) => {
    const items: ItemAdditional[] = products?.map((product) => {
        const itemAdded = additionalItemsAdded.find(item => item.product_id === product.id)
        const item: ItemAdditional = {
            product_id: product.id,
            name: product.name,
            quantity: itemAdded?.quantity || 0,
            additional_item_id: itemAdded?.id,
            category_id: product.category_id
        }
        return item
    })

    return items
}

const AdditionalItemList = ({ item }: ItemListProps) => {
    const [itemList, setItemList] = useState<ItemAdditional[]>([]);
    const [error, setError] = useState<RequestError | null>(null);
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const { data } = useSession();

    useEffect(() => {
        try {
            // Passo 1: Buscar a categoria atual do item
            const category = categoriesSlice.entities[item.category_id];
            if (!category) {
                return setItemList([]); // Caso não encontre a categoria, retorna lista vazia
            }

            // Passo 2: Buscar as categorias adicionais relacionadas à categoria do item
            const additionalCategories = category.product_category_to_additional;
            if (!additionalCategories || additionalCategories.length === 0) {
                return setItemList([]); // Se não houver categorias adicionais, retorna lista vazia
            }

            // Passo 3: Buscar os produtos disponíveis em cada categoria adicional
            const additionalItems = additionalCategories
                .map((additionalCategory) => categoriesSlice.entities[additionalCategory.id]?.products) // Obter os produtos de cada categoria adicional
                .flat(); // "Flatten" para uma lista única de produtos

            if (!additionalItems || additionalItems.length === 0) {
                return setItemList([]); // Se não houver produtos, retorna lista vazia
            }

            // Passo 4: Filtrar qualquer produto inválido antes de converter
            const validItems = additionalItems.filter(item => item != null && item !== undefined);

            // Passo 5: Converter os produtos válidos para itens
            const items = convertProductToItem(validItems, item.item_to_additional || []);
            // Passo 6: Verificar se após conversão existem itens válidos
            if (!items || items.length === 0) {
                return setItemList([]); // Se não houver itens válidos após a conversão, retorna lista vazia
            }

            // Atualiza o estado com os itens convertidos
            setItemList(items);

        } catch (error) {
            setError(error as RequestError);
        }
    }, [item.id]);

    const onChange = async (itemAdditional: ItemAdditional) => {
        if (!data) return

        if (itemAdditional.quantity === 0) {
            if (!itemAdditional.additional_item_id) return setError(new RequestError("Item indisponivel"))
                
            try {
                await DeleteAdditionalItem(itemAdditional.additional_item_id, data)
                setError(null)
            } catch (error) {
                setError(error as RequestError)
            }
            return
        }

        const category = categoriesSlice.entities[itemAdditional.category_id]
        if (!category) return setError(new RequestError("Categoria indisponivel"))
            
        const quantity = category?.quantities.find(quantity => quantity.quantity === itemAdditional.quantity)

        if (!quantity) return setError(new RequestError("Quantidade indisponivel"))

        try {
            await NewAdditionalItem(item.id, { product_id: itemAdditional.product_id, quantity_id: quantity?.id }, data)
            setError(null)
        } catch (error) {
            setError(error as RequestError)
        }
    }

    const handleIncrement = (itemAdditional: ItemAdditional) => {
        itemAdditional.quantity += 1
        onChange(itemAdditional)
        setItemList((prev) =>
            prev.map((item) =>
                item.product_id === itemAdditional.product_id ? { ...item, quantity: item.quantity } : item
            )
        );
    };

    const handleDecrement = (itemAdditional: ItemAdditional) => {
        itemAdditional.quantity -= 1
        onChange(itemAdditional)
        setItemList((prev) =>
            prev.map((item) =>
                item.product_id === itemAdditional.product_id && item.quantity > 0
                    ? { ...item, quantity: item.quantity }
                    : item
            )
        );
    };

    return (
        <div>
            <br className="my-4" />
            <h4 className="text-2md font-bold">Itens adicionais</h4>
            {error && <p className="text-red-500 mb-4">{error.message}</p>}
            <div className="space-y-4">
                {itemList?.map((item) => (
                    <div key={item.product_id} className="flex items-center space-x-4">
                        <div className="flex-1">{item.name}</div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleDecrement(item)}
                                className="bg-red-500 text-white px-3 py-1 rounded"
                            >
                                -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                                onClick={() => handleIncrement(item)}
                                className="bg-green-500 text-white px-3 py-1 rounded"
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdditionalItemList;
