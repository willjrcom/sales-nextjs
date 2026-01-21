import GroupItem from '@/app/entities/order/group-item';
import { useMemo } from 'react';
import Carousel from '../../carousel/carousel';
import AddComplementCard from './add-complement-item';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { GetComplementProducts } from '@/app/api/product/product';

const ComplementItemList = () => {
    const { data } = useSession();
    const queryClient = useQueryClient();
    const groupItem = queryClient.getQueryData<GroupItem | null>(['group-item', 'current']);

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
                    {(product) => <AddComplementCard key={product.id} product={product} />}
                </Carousel>
            </div>
        </div>
    );
};

export default ComplementItemList;
