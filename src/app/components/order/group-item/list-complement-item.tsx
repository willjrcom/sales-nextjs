import { useCategories } from '@/app/context/category/context';
import GroupItem from '@/app/entities/order/group-item';
import Product from '@/app/entities/product/product';
import React, { useEffect, useState } from 'react';
import Carousel from '../../carousel/carousel';
import AddComplementCard from './add-card-complement-item';

interface ItemListProps {
    groupItem?: GroupItem | null;
}

const ComplementItemList = ({ groupItem }: ItemListProps) => {
    const contextCategories = useCategories();
    const [complementItems, setComplementItems] = useState<Product[]>([]);

    useEffect(() => {
        try {
            if (!groupItem) return

            // Passo 1: Buscar a categoria atual do item
            const category = contextCategories.findByID(groupItem.category_id);
            if (!category) {
                return setComplementItems([]);
            }

            // Passo 2: Buscar as categorias adicionais relacionadas à categoria do item
            const complementCategories = category.product_category_to_complement;
            if (!complementCategories || complementCategories.length === 0) {
                return setComplementItems([]);
            }

            // Passo 3: Buscar os produtos disponíveis em cada categoria adicional
            const complementItems = complementCategories // groupItem.category?.product_category_to_complement
                .map((internalCategory) => contextCategories.findByID(internalCategory.id)?.products) // Obter os produtos de cada categoria adicional
                .flat(); // "Flatten" para uma lista única de produtos

            if (!complementItems || complementItems.length === 0) {
                return setComplementItems([]);
            }

            // Passo 4: Filtrar qualquer produto inválido antes de converter
            const validItems = complementItems.filter(item => item != null && item !== undefined);

            const validSizeItems = validItems.filter(item => item.size.name === groupItem.size);
            setComplementItems(validSizeItems);
        } catch (error) {
            console.error("Erro ao buscar itens adicionais:", error);
            setComplementItems([]);
        }
    }, [groupItem?.id]);

    return (
        <div>
            <br className="my-4" />
            <h4 className="text-2md font-bold">Itens adicionais</h4>
            <div className="space-y-4">
                <Carousel items={complementItems}>
                    {(product) => <AddComplementCard key={product.id} groupItem={groupItem} product={product} />}
                </Carousel>
            </div>
        </div>
    );
};

export default ComplementItemList;
