"use client";

import { useSession } from 'next-auth/react';
import ThreeColumnHeader from "@/components/header/three-column-header";
import Refresh, { FormatRefreshTime } from '@/app/components/crud/refresh';
import { useMemo, useState } from 'react';
import PageTitle from '@/app/components/ui/page-title';
import { useQuery } from '@tanstack/react-query';
import CardCategory from './card-category';
import { GetCategoriesWithOrderProcess } from '@/app/api/category/category';
import { Settings, AlertCircle, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Category from '@/app/entities/category/category';
import { useUser } from '@/app/context/user-context';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import ListProcessRule from '@/app/forms/category/list-process-rule';

const OrderProcess = () => {
    const { data } = useSession();
    const { hasPermission } = useUser();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    // Endpoint eficiente que já traz categorias + processos + contagens
    const { isFetching, data: allCategories = [], refetch } = useQuery({
        queryKey: ['categories', 'with-order-process'],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetCategoriesWithOrderProcess(data!);
        },
        enabled: !!(data as any)?.user?.access_token,
        refetchInterval: 30000,
    });

    // Categorias que devem aparecer (não são adicionais/complementos)
    const relevantCategories = useMemo(() =>
        allCategories.filter(c => !c.is_additional && !c.is_complement),
        [allCategories]);

    // Categorias marcadas para usar processos mas sem NENHUMA regra cadastrada
    const emptyCategories = useMemo(() =>
        relevantCategories.filter(c => !c.process_rules || c.process_rules.length === 0),
        [relevantCategories]);

    // Todas as categorias que usam processos (com ou sem regras) para exibir como cards
    const categoriesToDisplay = useMemo(() =>
        relevantCategories.filter(c => c.process_rules && c.process_rules.length > 0),
        [relevantCategories]);

    return (
        <div className='w-full min-h-full px-4 py-4 space-y-4 bg-gray-50/30'>
            <ThreeColumnHeader
                center={
                    <div className="text-center">
                        <PageTitle
                            title="Monitor de Produção"
                            tooltip="Acompanhe o fluxo de preparo dos pedidos em tempo real."
                        />
                    </div>
                }
                right={
                    <div className="flex items-center gap-4">
                        <Refresh
                            onRefresh={refetch}
                            isFetching={isFetching}
                            lastUpdate={lastUpdate}
                            optionalText='Produção'
                        />
                    </div>
                }
                className="mb-4"
            />

            {/* Banner de Categorias Sem Configuração */}
            {hasPermission('edit-order-process') && emptyCategories.length > 0 && (
                <div className="bg-amber-50 border border-amber-100/50 rounded-2xl p-4 flex flex-col gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-amber-900">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <h3 className="font-bold text-sm tracking-tight uppercase">Categorias Pendentes de Configuração</h3>
                        </div>
                        <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-amber-700/60 uppercase tracking-tighter">
                            <Settings className="w-3 h-3" /> Cardápio
                            <ChevronRight className="w-2 h-2" /> Categoria
                            <ChevronRight className="w-2 h-2" /> <span className="text-amber-600 underline">Gerenciar Regras de Processo</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {emptyCategories.map(cat => (
                            <Dialog key={cat.id}>
                                <DialogTrigger asChild>
                                    <Badge className="bg-white cursor-pointer border-amber-200 text-amber-700 font-bold py-1 px-3 shadow-sm hover:scale-105 hover:bg-amber-50 transition-all duration-200">
                                        {cat.name}
                                    </Badge>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Configurar Regras: {cat.name}</DialogTitle>
                                    </DialogHeader>
                                    <ListProcessRule category={cat} />
                                </DialogContent>
                            </Dialog>
                        ))}
                    </div>

                    <div className="md:hidden flex items-center gap-1.5 text-[10px] font-bold text-amber-700/60 pt-2 border-t border-amber-100">
                        <Settings className="w-3 h-3" /> Cardápio {"->"} Categoria {"->"} Regras
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {categoriesToDisplay?.map((category: Category) => (
                    <CardCategory key={category.id} category={category} />
                ))}
            </div>

            {categoriesToDisplay.length === 0 && !isFetching && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="p-6 bg-gray-100 rounded-full">
                        <Settings className="w-10 h-10 text-gray-300" />
                    </div>
                    <div className="max-w-xs">
                        <h4 className="text-lg font-bold text-gray-900">Nenhum processo ativo</h4>
                        <p className="text-sm text-gray-500">Configure as regras de processo nas categorias para monitorar a produção.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderProcess;
