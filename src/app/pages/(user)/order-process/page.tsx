"use client";

import { useSession } from 'next-auth/react';
import Refresh, { FormatRefreshTime } from '@/app/components/crud/refresh';
import React, { useMemo, useState } from 'react';
import PageTitle from '@/app/components/PageTitle';
import { useQuery } from '@tanstack/react-query';
import CardCategory from './card-category';
import { GetCategoriesMap } from '@/app/api/category/category';

const OrderProcess = () => {
    const { data } = useSession();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    const { isPending, data: categoriesResponse = [], refetch } = useQuery({
        queryKey: ['categories', 'map', 'order-process'],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetCategoriesMap(data!, true, false, false);
        },
        enabled: !!data?.user?.access_token,
        refetchInterval: 30000,
    });

    const categories = useMemo(() => categoriesResponse || [], [categoriesResponse]);

    return (
        <div className='max-w-[85vw] flex-auto h-full'>
            <div className="flex items-center justify-between mb-4">
                <PageTitle title="Processos" tooltip="Exibe as regras de processamento de pedidos, agrupadas por categoria, com indicadores de atraso e fila." />
                <Refresh
                    onRefresh={refetch}
                    isPending={isPending}
                    lastUpdate={lastUpdate}
                    optionalText='Categoria'
                />
            </div>
            {categories?.map((category) => <CardCategory key={category.id} category={category} />)}
        </div>
    );
};


export default OrderProcess;
