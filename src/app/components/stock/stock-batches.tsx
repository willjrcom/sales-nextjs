'use client';

import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { GetBatchesByStockID } from '@/app/api/stock/batches';
import Decimal from 'decimal.js';
import { useQuery } from '@tanstack/react-query';
import Refresh, { FormatRefreshTime } from '../crud/refresh';

interface StockBatchesProps {
    stockID: string;
}

const StockBatches = ({ stockID }: StockBatchesProps) => {
    const { data } = useSession();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    const { isFetching, isLoading, data: batchesResponse, refetch } = useQuery({
        queryKey: ['stock-batches', stockID],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetBatchesByStockID(stockID, data!);
        },
        enabled: !!data?.user?.access_token,
    });

    const batches = batchesResponse || [];

    const getBatchStatus = (expiresAt?: string) => {
        if (!expiresAt) return null;
        const now = new Date();
        const expiry = new Date(expiresAt);
        const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft <= 0) return { label: 'Vencido', className: 'bg-red-100 text-red-800' };
        if (daysLeft <= 30) return { label: `Vence em ${daysLeft}d`, className: 'bg-orange-100 text-orange-800' };
        return { label: `Vence em ${daysLeft}d`, className: 'bg-green-100 text-green-800' };
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Lotes em Estoque</h2>
                <Refresh onRefresh={refetch} isFetching={isFetching} lastUpdate={lastUpdate} />
            </div>

            {isLoading && (
                <div className="mb-6">
                    <p>Carregando...</p>
                </div>
            )}

            {!isLoading && batches.length === 0 && (
                <div className="mb-6">
                    <p>Nenhum lote encontrado</p>
                </div>
            )}

            {!isLoading && batches.length > 0 && (
                <div className="space-y-4">
                    {batches.map((batch) => {
                        const status = getBatchStatus(batch.expires_at);
                        return (
                            <div key={batch.id} className="bg-white border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm text-gray-500">
                                                {new Date(batch.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                            {status && (
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.className}`}>
                                                    {status.label}
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">Quantidade Inicial:</span>
                                                <span className="ml-2">{new Decimal(batch.initial_quantity).toFixed(3)}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Quantidade Atual:</span>
                                                <span className="ml-2 font-semibold">{new Decimal(batch.current_quantity).toFixed(3)}</span>
                                            </div>
                                            {new Decimal(batch.cost_price).greaterThan(0) && (
                                                <div>
                                                    <span className="font-medium">Custo Unitário:</span>
                                                    <span className="ml-2">R$ {new Decimal(batch.cost_price).toFixed(2)}</span>
                                                </div>
                                            )}
                                            {batch.expires_at && (
                                                <div>
                                                    <span className="font-medium">Validade:</span>
                                                    <span className="ml-2">{new Date(batch.expires_at).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StockBatches;
