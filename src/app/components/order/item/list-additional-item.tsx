import DeleteAdditionalItem from '@/app/api/item/delete/additional/route';
import NewAdditionalItem from '@/app/api/item/update/additional/route';
import { useCategories } from '@/app/context/category/context';
import Item from '@/app/entities/order/item';
import Product from '@/app/entities/product/product';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

interface ItemAdditional {
    id: string;
    name: string;
    quantity: number;
}

interface ItemListProps {
    item: Item;
}

const convertProductToItem = (products: Product[]) => {
    const items: ItemAdditional[] = products?.map((product) => {
        const item: ItemAdditional = {
            id: product.id,
            name: product.name,
            quantity: 0
        }
        return item
    })

    return items
}

const AdditionalItemList = ({ item }: ItemListProps) => {
    const contextCategories = useCategories();
    const [itemList, setItemList] = useState<ItemAdditional[]>([]);
    const { data } = useSession(); 

    useEffect(() => {
        try {
            // Passo 1: Buscar a categoria atual do item
            const category = contextCategories.findByID(item.category_id);
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
                .map((internalCategory) => contextCategories.findByID(internalCategory.id)?.products) // Obter os produtos de cada categoria adicional
                .flat(); // "Flatten" para uma lista única de produtos

            if (!additionalItems || additionalItems.length === 0) {
                return setItemList([]); // Se não houver produtos, retorna lista vazia
            }

            console.log(additionalCategories)

            // Passo 4: Filtrar qualquer produto inválido antes de converter
            const validItems = additionalItems.filter(item => item != null && item !== undefined);

            // Passo 5: Converter os produtos válidos para itens
            const items = convertProductToItem(validItems);
            // Passo 6: Verificar se após conversão existem itens válidos
            if (!items || items.length === 0) {
                return setItemList([]); // Se não houver itens válidos após a conversão, retorna lista vazia
            }

            // Atualiza o estado com os itens convertidos
            setItemList(items);

        } catch (error) {
            console.error("Erro ao buscar itens adicionais:", error);
            setItemList([]); // Caso ocorra um erro, retorna lista vazia
        }
    }, [item.id]);

    const onAdd = async(idProduct: string) => {
        if (!data) return

        try {
            NewAdditionalItem(item.id, { product_id: idProduct, quantity_id: ""}, data)
            
        } catch (error) {
            console.log(error)
        }
    }

    const onRemove = async (idProduct: string) => {
        if (!data) return

        try {
            DeleteAdditionalItem(idProduct, data)
            
        } catch (error) {
            console.log(error)
        }
    }

    const handleIncrement = async (idProduct: string) => {
        await onAdd(idProduct)
        setItemList((prev) =>
            prev.map((item) =>
                item.id === idProduct ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    const handleDecrement = async (idProduct: string) => {
        await onRemove(idProduct)
        setItemList((prev) =>
            prev.map((item) =>
                item.id === idProduct && item.quantity > 0
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    };

    return (
        <div>
            <br className="my-4" />
            <h4 className="text-2md font-bold">Itens adicionais</h4>
            <div className="space-y-4">
                {itemList?.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                        <div className="flex-1">{item.name}</div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleDecrement(item.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded"
                            >
                                -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                                onClick={() => handleIncrement(item.id)}
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
