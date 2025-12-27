'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import PageProducts from './product';
import PageCategories from './category';
import PageProcessRules from './process-rule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PageWithTabs = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentTab = searchParams.get('tab') || 'products';

    const handleTabChange = (value: string) => {
        router.push(`?tab=${value}`, { scroll: false });
    };

    return (
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="categories">Categorias</TabsTrigger>
                <TabsTrigger value="products">Produtos</TabsTrigger>
                <TabsTrigger value="process-rules">Processos</TabsTrigger>
            </TabsList>
            <TabsContent value="categories">
                <PageCategories />
            </TabsContent>
            <TabsContent value="products">
                <PageProducts />
            </TabsContent>
            <TabsContent value="process-rules">
                <PageProcessRules />
            </TabsContent>
        </Tabs>
    );
};

export default PageWithTabs;
