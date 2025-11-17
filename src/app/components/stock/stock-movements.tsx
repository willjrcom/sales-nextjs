'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { GetMovementsByStockID } from '@/app/api/stock/movements';
import StockMovement from '@/app/entities/stock/stock-movement';
import { notifyError } from '@/app/utils/notifications';
import RequestError from '@/app/utils/error';
import Decimal from 'decimal.js';

interface StockMovementsProps {
    stockID: string;
}

const StockMovements = ({ stockID }: StockMovementsProps) => {
    const { data } = useSession();
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadMovements = async () => {
            if (!data || !stockID) return;
            setLoading(true);

            try {
                const movementsData = await GetMovementsByStockID(stockID, data);
                setMovements(movementsData);
            } catch (error) {
                const err = error as RequestError;
                notifyError(err.message || 'Erro ao carregar movimentos');
            } finally {
                setLoading(false);
            }
        };

        loadMovements();
    }, [data?.user.access_token, stockID]);

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
            case 'adjust':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Histórico de Movimentos</h2>
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Histórico de Movimentos</h2>
            
            {movements.length === 0 ? (
                <p className="text-gray-500">Nenhum movimento encontrado</p>
            ) : (
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