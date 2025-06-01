import GroupItem from '@/app/entities/order/group-item';
import Product from '@/app/entities/product/product';
import React, { useEffect, useState } from 'react';
import Carousel from '../../carousel/carousel';
import AddComplementCard from './add-complement-item';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import RequestError from '@/app/utils/error';
import { notifyError } from '@/app/utils/notifications';

interface ItemListProps {
    groupItem?: GroupItem | null;
}

const ComplementItemList = ({ groupItem }: ItemListProps) => {
    const [complementItems, setComplementItems] = useState<Product[]>([]);
    const categoriesSlice = useSelector((state: RootState) => state.categories);

    useEffect(() => {
        try {
            if (!groupItem) return

            // Passo 1: Buscar a categoria atual do item
            const category = categoriesSlice.entities[groupItem.category_id];
            if (!category) {
                return setComplementItems([]);
            }

            // Passo 2: Buscar as categorias adicionais relacionadas à categoria do item
            const complementCategories = category.complement_categories;
            if (!complementCategories || complementCategories.length === 0) {
                return setComplementItems([]);
            }

            // Passo 3: Buscar os produtos disponíveis em cada categoria adicional
            const complementItems = complementCategories // groupItem.category?.complement_categories
                .map((internalCategory) => categoriesSlice.entities[internalCategory.id]?.products) // Obter os produtos de cada categoria adicional
                .flat(); // "Flatten" para uma lista única de produtos

            if (!complementItems || complementItems.length === 0) {
                return setComplementItems([]);
            }

            // Passo 4: Filtrar qualquer produto inválido antes de converter
            const validItems = complementItems.filter(item => item != null && item !== undefined);

            const validSizeItems = validItems.filter(item => item.size.name === groupItem.size);
            setComplementItems(validSizeItems);
        } catch (error: RequestError | any) {
            notifyError(error)
            setComplementItems([]);
        }
    }, [groupItem?.id]);

    return (
        <div>
            <br className="my-4" />
            <div className="space-y-4">
                {complementItems.length === 0 && <p className="text-gray-500">Nenhum produto disponível</p>}
                <Carousel items={complementItems}>
                    {(product) => <AddComplementCard key={product.id} groupItem={groupItem} product={product} />}
                </Carousel>
            </div>
        </div>
    );
};

export default ComplementItemList;
