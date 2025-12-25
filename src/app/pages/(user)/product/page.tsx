'use client';

import PageProducts from './product';
import PageCategories from './category';
import PageProcessRules from './process-rule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PageWithTabs = () => {
    return (
        <Tabs defaultValue="produtos" className="w-full">
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
