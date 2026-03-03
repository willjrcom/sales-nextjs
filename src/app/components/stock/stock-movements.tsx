'use client';

import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { GetMovementsByStockID } from '@/app/api/stock/movements';
import Decimal from 'decimal.js';
import { useQuery } from '@tanstack/react-query';
import Refresh, { FormatRefreshTime } from '../crud/refresh';

interface StockMovementsProps {
    stockID: string;
}

const StockMovements = ({ stockID }: StockMovementsProps) => {
    const { data } = useSession();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const { isFetching, isLoading, data: stockMovementsResponse, refetch } = useQuery({
        queryKey: ['stock-movements', stockID, selectedDate],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetMovementsByStockID(data!, stockID, selectedDate);
        },
        enabled: !!data?.user?.access_token,
        refetchInterval: 30000,
    });

    const movements = stockMovementsResponse || [];

    const getMovementTypeLabel = (type: string) => {
        switch (type) {
            case 'in':
                return 'Entrada';
            case 'out':
                return 'Saída';
            case 'adjust':
                return 'Ajuste';
            case 'adjust_in':
                return 'Ajuste de Entrada';
            case 'adjust_out':
                return 'Ajuste de Saída';
            case 'reserve':
                return 'Reserva';
            case 'restore':
                return 'Restauração';
            default:
                return type;
        }
    };

    const getMovementTypeColor = (type: string) => {
        switch (type) {
            case 'in':
                return 'bg-green-100 text-green-800';
            case 'out':
                return 'bg-red-100 text-red-800';
            case 'adjust_in':
            case 'adjust':
                return 'bg-blue-100 text-blue-800';
            case 'adjust_out':
                return 'bg-yellow-100 text-yellow-800';
            case 'reserve':
                return 'bg-purple-100 text-purple-800';
            case 'restore':
                return 'bg-teal-100 text-teal-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold mb-6">Histórico de Movimentos</h2>
                <div className="flex items-center gap-4">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Refresh onRefresh={refetch} isFetching={isFetching} lastUpdate={lastUpdate} />
                </div>
            </div>

            {isLoading && (
                <div className="mb-6">
                    <p>Carregando...</p>
                </div>
            )}

            {!isLoading && movements.length === 0 && (
                <div className="mb-6">
                    <p>Nenhum movimento encontrado</p>
                </div>
            )}

            {!isLoading && movements.length > 0 && (
                <div className="space-y-4">
                    {movements.map((movement) => (
                        <div key={movement.id} className="bg-white border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMovementTypeColor(movement.type)}`}>
                                            {getMovementTypeLabel(movement.type)}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(movement.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="font-semibold mb-1">{movement.reason}</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Quantidade:</span>
                                            <span className="ml-2">{new Decimal(movement.quantity).toFixed(2)}</span>
                                        </div>
                                        {movement.price?.greaterThan(0) && (
                                            <div>
                                                <span className="font-medium">Custo Unitário:</span>
                                                <span className="ml-2">R$ {new Decimal(movement.price).toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


export default StockMovements; 