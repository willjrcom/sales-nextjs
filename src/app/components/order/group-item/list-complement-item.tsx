import GroupItem from '@/app/entities/order/group-item';
import Product from '@/app/entities/product/product';
import React, { useEffect, useState } from 'react';
import Carousel from '../../carousel/carousel';
import AddComplementCard from './add-card-complement-item';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import RequestError from '@/app/api/error';

interface ItemListProps {
    groupItem?: GroupItem | null;
}

const ComplementItemList = ({ groupItem }: ItemListProps) => {
    const [complementItems, setComplementItems] = useState<Product[]>([]);
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const [error, setError] = useState<RequestError | null>(null);

    useEffect(() => {
        try {
            if (!groupItem) return

            // Passo 1: Buscar a categoria atual do item
            const category = categoriesSlice.entities[groupItem.category_id];
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
                .map((internalCategory) => categoriesSlice.entities[internalCategory.id]?.products) // Obter os produtos de cada categoria adicional
                .flat(); // "Flatten" para uma lista única de produtos

            if (!complementItems || complementItems.length === 0) {
                return setComplementItems([]);
            }

            // Passo 4: Filtrar qualquer produto inválido antes de converter
            const validItems = complementItems.filter(item => item != null && item !== undefined);

            const validSizeItems = validItems.filter(item => item.size.name === groupItem.size);
            setComplementItems(validSizeItems);
        } catch (error) {
            setError(error as RequestError)
            setComplementItems([]);
        }
    }, [groupItem?.id]);

    return (
        <div>
            <br className="my-4" />
            {error && <p className="text-red-500 mb-4">{error.message}</p>}
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
