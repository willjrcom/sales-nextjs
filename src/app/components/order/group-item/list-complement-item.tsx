import GroupItem from '@/app/entities/order/group-item';
import React, { useMemo } from 'react';
import Carousel from '../../carousel/carousel';
import AddComplementCard from './add-complement-item';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { GetComplementProducts } from '@/app/api/product/product';

interface ItemListProps {
    groupItem?: GroupItem | null;
}

const ComplementItemList = ({ groupItem }: ItemListProps) => {
    const { data } = useSession();
    const { data: complementProductsResponse } = useQuery({
        queryKey: ['complement-products', groupItem?.category_id],
        queryFn: () => GetComplementProducts(data!, groupItem?.category_id || ""),
        enabled: !!data?.user?.access_token,
    });

    const complementItems = useMemo(() => complementProductsResponse?.items || [], [complementProductsResponse?.items]);

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
