import GroupItem from '@/app/entities/order/group-item';
import Product from '@/app/entities/product/product';
import React, { useEffect, useState } from 'react';
import Carousel from '../../carousel/carousel';
import AddComplementCard from './add-complement-item';
import RequestError from '@/app/utils/error';
import { notifyError } from '@/app/utils/notifications';
import { useQuery } from '@tanstack/react-query';
import GetCategories from '@/app/api/category/category';
import { useSession } from 'next-auth/react';

interface ItemListProps {
    groupItem?: GroupItem | null;
}

const ComplementItemList = ({ groupItem }: ItemListProps) => {
    const [complementItems, setComplementItems] = useState<Product[]>([]);
    const { data } = useSession();

    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories'],
        queryFn: () => GetCategories(data!),
        enabled: !!data?.user?.access_token,
    });

    const categories = categoriesResponse?.items || [];

    useEffect(() => {
        try {
            if (!groupItem) return

            const category = categories.find(c => c.id === groupItem.category_id);
            if (!category) {
                return setComplementItems([]);
            }

            const complementCategories = category.complement_categories;
            if (!complementCategories || complementCategories.length === 0) {
                return setComplementItems([]);
            }

            const complementItemsFound = complementCategories
                .map((internalCategory) => categories.find(c => c.id === internalCategory.id)?.products)
                .flat();

            if (!complementItemsFound || complementItemsFound.length === 0) {
                return setComplementItems([]);
            }

            const validItems = complementItemsFound.filter(item => item != null && item !== undefined);
            const validSizeItems = validItems.filter(item => item!.size.name === groupItem.size);
            setComplementItems(validSizeItems as Product[]);
        } catch (error: RequestError | any) {
            notifyError(error)
            setComplementItems([]);
        }
    }, [groupItem?.id, categories]);

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
