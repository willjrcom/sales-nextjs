'use client';

import React, { useMemo, useState } from 'react';
import { HiClock, HiUsers, HiChartBar, HiTrendingUp } from 'react-icons/hi';
import Shift from '@/app/entities/shift/shift';

interface ProductionAnalyticsCardProps {
    shift: Shift;
}

const ProductionAnalyticsCard = ({ shift }: ProductionAnalyticsCardProps) => {
    const [showDetails, setShowDetails] = useState(false);

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const formatPercentage = (value: number): string => {
        return `${Number(value).toFixed(1)}%`;
    };

    const getEfficiencyColor = (score: number): string => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Verifica se há dados de produção disponíveis
    const hasProductionData = useMemo(() => shift.total_processes > 0 || (shift.order_process_analytics && Object.keys(shift.order_process_analytics).length > 0), [shift.total_processes, shift.order_process_analytics]);

    if (!hasProductionData) {
        return (
            <div className="bg-white p-4 shadow-md rounded-lg">
                <div className="flex items-center mb-3">
                    <HiChartBar className="text-blue-500 text-xl mr-2" />
                    <h3 className="text-lg font-semibold">Produção</h3>
                </div>
                <p className="text-gray-500 text-sm">Dados não disponíveis</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 shadow-md rounded-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <HiChartBar className="text-blue-500 text-xl mr-2" />
                    <h3 className="text-lg font-semibold">Produção</h3>
                </div>
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                >
                    {showDetails ? 'Menos' : 'Mais'}
                </button>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <HiClock className="text-blue-500 mr-2" />
                        <span className="text-sm text-gray-600">Tempo Médio</span>
                    </div>
                    <span className="font-semibold">
                        {formatDuration(shift.average_process_time)}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <HiUsers className="text-green-500 mr-2" />
                        <span className="text-sm text-gray-600">Processos</span>
                    </div>
                    <span className="font-semibold">
                        {shift.total_processes}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <HiTrendingUp className="text-purple-500 mr-2" />
                        <span className="text-sm text-gray-600">Eficiência</span>
                    </div>
                    <span className={`font-semibold ${getEfficiencyColor(shift.process_efficiency_score)}`}>
                        {formatPercentage(shift.process_efficiency_score)}
                    </span>
                </div>
            </div>

            {/* Detalhes expandidos */}
            {showDetails && shift.order_process_analytics && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold mb-3 text-sm">Por Regra de Processo</h4>
                    <div className="space-y-2">
                        {Object.entries(shift.order_process_analytics).slice(0, 3).map(([ruleName, analytics]) => (
                            <div key={analytics.process_rule_id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 truncate">{ruleName}</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {analytics.total_processes}
                                    </span>
                                    <span className={`text-xs ${getEfficiencyColor(analytics.efficiency_score)}`}>
                                        {formatPercentage(analytics.efficiency_score)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {Object.keys(shift.order_process_analytics).length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                                +{Object.keys(shift.order_process_analytics).length - 3} mais
                            </p>
                        )}
                    </div>

                    {/* Top funcionários */}
                    {shift.order_process_analytics && Object.values(shift.order_process_analytics).some(analytics =>
                        analytics.employee_performance && Object.keys(analytics.employee_performance).length > 0
                    ) && (
                            <div className="mt-4">
                                <h4 className="font-semibold mb-2 text-sm">Top Funcionários</h4>
                                <div className="space-y-1">
                                    {Object.values(shift.order_process_analytics)
                                        .flatMap(analytics =>
                                            Object.values(analytics.employee_performance || {})
                                        )
                                        .sort((a, b) => b.efficiency_score - a.efficiency_score)
                                        .slice(0, 2)
                                        .map((employee, index) => (
                                            <div key={"analytics-card-" + employee.employee_id} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center">
                                                    <span className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                                        <span className="text-blue-600 text-xs font-semibold">{index + 1}</span>
                                                    </span>
                                                    <span className="text-gray-600 truncate">{employee.employee_name}</span>
                                                </div>
                                                <span className={`text-xs ${getEfficiencyColor(employee.efficiency_score)}`}>
                                                    {formatPercentage(employee.efficiency_score)}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                </div>
            )}
        </div>
    );
};

export default ProductionAnalyticsCard; 