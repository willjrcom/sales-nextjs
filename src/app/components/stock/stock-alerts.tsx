'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { GetAllAlerts, ResolveAlert, DeleteAlert } from '@/app/api/stock/alerts';
import StockAlert from '@/app/entities/stock/stock-alert';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import RequestError from '@/app/utils/error';
import { FaCheck, FaTrash } from 'react-icons/fa';

const StockAlerts = () => {
    const { data } = useSession();
    const [alerts, setAlerts] = useState<StockAlert[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadAlerts = async () => {
            if (!data) return;
            setLoading(true);

            try {
                const alertsData = await GetAllAlerts(data);
                setAlerts(alertsData || []);
            } catch (error) {
                const err = error as RequestError;
                notifyError(err.message || 'Erro ao carregar alertas');
                setAlerts([]);
            } finally {
                setLoading(false);
            }
        };

        loadAlerts();
    }, [data?.user.access_token]);

    const handleResolveAlert = async (alertId: string) => {
        if (!data) return;

        try {
            await ResolveAlert(alertId, data);
            setAlerts(prev => prev.map(alert => 
                alert.id === alertId 
                    ? { ...alert, is_resolved: true, resolved_at: new Date().toISOString() }
                    : alert
            ));
            notifySuccess('Alerta resolvido com sucesso');
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao resolver alerta');
        }
    };

    const handleDeleteAlert = async (alertId: string) => {
        if (!data) return;

        try {
            await DeleteAlert(alertId, data);
            setAlerts(prev => prev.filter(alert => alert.id !== alertId));
            notifySuccess('Alerta removido com sucesso');
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao remover alerta');
        }
    };

    const getAlertTypeColor = (type: string) => {
        switch (type) {
            case 'low_stock':
                return 'bg-yellow-100 text-yellow-800';
            case 'out_of_stock':
                return 'bg-red-100 text-red-800';
            case 'over_stock':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getAlertTypeLabel = (type: string) => {
        switch (type) {
            case 'low_stock':
                return 'Estoque Baixo';
            case 'out_of_stock':
                return 'Sem Estoque';
            case 'over_stock':
                return 'Estoque Alto';
            default:
                return 'Alerta';
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Alertas de Estoque</h2>
                <p>Carregando...</p>
            </div>
        );
    }

    // Ensure alerts is always an array
    const safeAlerts = Array.isArray(alerts) ? alerts : [];
    const activeAlerts = safeAlerts.filter(alert => !alert.is_resolved);
    const resolvedAlerts = safeAlerts.filter(alert => alert.is_resolved);

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Alertas de Estoque</h2>
            
            {/* Alertas Ativos */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Alertas Ativos ({activeAlerts.length})</h3>
                {activeAlerts.length === 0 ? (
                    <p className="text-gray-500">Nenhum alerta ativo</p>
                ) : (
                    <div className="space-y-3">
                        {activeAlerts.map((alert) => (
                            <div key={alert.id} className="bg-white border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getAlertTypeColor(alert.type)}`}>
                                                {getAlertTypeLabel(alert.type)}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {new Date(alert.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="font-semibold mb-1">{alert.product?.name || 'Produto não encontrado'}</h4>
                                        <p className="text-gray-600">{alert.message}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            title="Resolver Alerta"
                                            onClick={() => handleResolveAlert(alert.id)}
                                            className="p-2 rounded hover:bg-green-100"
                                        >
                                            <FaCheck className="text-green-600" />
                                        </button>
                                        <button
                                            title="Remover Alerta"
                                            onClick={() => handleDeleteAlert(alert.id)}
                                            className="p-2 rounded hover:bg-red-100"
                                        >
                                            <FaTrash className="text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Alertas Resolvidos */}
            {resolvedAlerts.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-3">Alertas Resolvidos ({resolvedAlerts.length})</h3>
                    <div className="space-y-3">
                        {resolvedAlerts.map((alert) => (
                            <div key={alert.id} className="bg-gray-50 border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                Resolvido
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {new Date(alert.resolved_at || '').toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="font-semibold mb-1">{alert.product?.name || 'Produto não encontrado'}</h4>
                                        <p className="text-gray-600">{alert.message}</p>
                                    </div>
                                    <button
                                        title="Remover Alerta"
                                        onClick={() => handleDeleteAlert(alert.id)}
                                        className="p-2 rounded hover:bg-red-100"
                                    >
                                        <FaTrash className="text-red-600" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockAlerts; 