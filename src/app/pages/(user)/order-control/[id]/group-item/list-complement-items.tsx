import GroupItem from '@/app/entities/order/group-item';
import { useMemo } from 'react';
import Carousel from '../../../../../../components/carousel/carousel';
import AddComplementItemModal from './add-complement-item-modal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { GetComplementProducts } from '@/app/api/product/product';

const ListComplementItems = () => {
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
        <div className="py-4">
            <div className="space-y-4">
                {complementItems.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                        <p className="text-gray-400 text-sm italic">Nenhum produto disponível para esta categoria</p>
                    </div>
                )}
                {complementItems.length > 0 && (
                    <Carousel items={complementItems}>
                        {(product) => <AddComplementItemModal key={product.id} product={product} />}
                    </Carousel>
                )}
            </div>
        </div>
    );
};

export default ListComplementItems;
