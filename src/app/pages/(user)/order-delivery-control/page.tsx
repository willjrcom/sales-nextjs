'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import PageTitle from '@/app/components/ui/page-title';
import DeliveryOrderToShip from "./delivery-to-ship";
import DeliveryOrderToFinish from "./delivery-to-finish";
import DeliveryOrderFinished from "./delivery-finished";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ThreeColumnHeader from '@/components/header/three-column-header';

const PageDeliveryOrder = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentTab = searchParams.get('tab') || 'to-ship';

    const handleTabChange = (value: string) => {
        router.push(`?tab=${value}`, { scroll: false });
    };

    return (
        <div className="w-full px-3 py-2">
            <ThreeColumnHeader center={<PageTitle title="Controle de Entregas" tooltip="Gerencie pedidos de entrega por status: A enviar, Na rua ou Finalizadas." />} />
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="to-ship">A enviar</TabsTrigger>
                    <TabsTrigger value="to-finish">Na rua</TabsTrigger>
                    <TabsTrigger value="finished">Finalizadas</TabsTrigger>
                </TabsList>
                <TabsContent value="to-ship">
                    <DeliveryOrderToShip />
                </TabsContent>
                <TabsContent value="to-finish">
                    <DeliveryOrderToFinish />
                </TabsContent>
                <TabsContent value="finished">
                    <DeliveryOrderFinished />
                </TabsContent>
            </Tabs>
        </div>
    );
};


export default PageDeliveryOrder