'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageDragAndDropGrid from './organization';
import PageTable from './table';
import PagePlace from './place';

const PageWithTabs = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentTab = searchParams.get('tab') || 'organization';

    const handleTabChange = (value: string) => {
        router.push(`?tab=${value}`, { scroll: false });
    };

    return (
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="organization">Organização</TabsTrigger>
                <TabsTrigger value="tables">Mesas</TabsTrigger>
                <TabsTrigger value="places">Ambientes</TabsTrigger>
            </TabsList>
            <TabsContent value="organization">
                <PageDragAndDropGrid />
            </TabsContent>
            <TabsContent value="tables">
                <PageTable />
            </TabsContent>
            <TabsContent value="places">
                <PagePlace />
            </TabsContent>
        </Tabs>
    );
};

export default PageWithTabs;
