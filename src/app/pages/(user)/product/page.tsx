'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import PageProducts from './product';
import PageCategories from './category';
import PageProcessRules from './process-rule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PageWithTabs = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentTab = searchParams.get('tab') || 'produtos';

    const handleTabChange = (value: string) => {
        router.push(`?tab=${value}`, { scroll: false });
    };

    return (
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="categorias">Categorias</TabsTrigger>
                <TabsTrigger value="produtos">Produtos</TabsTrigger>
                <TabsTrigger value="processos">Processos</TabsTrigger>
            </TabsList>
            <TabsContent value="categorias">
                <PageCategories />
            </TabsContent>
            <TabsContent value="produtos">
                <PageProducts />
            </TabsContent>
            <TabsContent value="processos">
                <PageProcessRules />
            </TabsContent>
        </Tabs>
    );
};

export default PageWithTabs;
