'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import PageTitle from '@/app/components/PageTitle';
import DeliveryOrderToShip from "./delivery-to-ship";
import DeliveryOrderToFinish from "./delivery-to-finish";
import DeliveryOrderFinished from "./delivery-finished";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PageDeliveryOrder = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentTab = searchParams.get('tab') || 'a-enviar';

    const handleTabChange = (value: string) => {
        router.push(`?tab=${value}`, { scroll: false });
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <PageTitle title="Controle de Entregas" tooltip="Gerencie pedidos de entrega por status: A enviar, Na rua ou Finalizadas." />
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="a-enviar">A enviar</TabsTrigger>
                    <TabsTrigger value="na-rua">Na rua</TabsTrigger>
                    <TabsTrigger value="finalizadas">Finalizadas</TabsTrigger>
                </TabsList>
                <TabsContent value="a-enviar">
                    <DeliveryOrderToShip />
                </TabsContent>
                <TabsContent value="na-rua">
                    <DeliveryOrderToFinish />
                </TabsContent>
                <TabsContent value="finalizadas">
                    <DeliveryOrderFinished />
                </TabsContent>
            </Tabs>
        </div>
    );
};


export default PageDeliveryOrder