'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { HiClock, HiUsers, HiChartBar, HiTrendingUp, HiTrendingDown } from 'react-icons/hi';

interface ProductionAnalyticsDashboardProps {
    shiftId: string;
}

// Defina os tipos localmente se necessário:

type ProcessRuleReport = {
    process_rule_id: string;
    process_rule_name: string;
    total_processes: number;
    completed_processes: number;
    canceled_processes: number;
    average_process_time: number;
    total_process_time: number;
    total_paused_count: number;
    efficiency_score: number;
    average_queue_time: number;
    total_queue_time: number;
    categories_processed: Record<string, {
        category_name: string;
        total_processed: number;
        average_process_time: number;
        canceled_count: number;
    }>;
};

type EmployeeProcessMetrics = {
    employee_id: string;
    employee_name: string;
    total_processed: number;
    average_process_time: number;
    efficiency_score: number;
};

type ProductionReport = {
    average_process_time: number;
    total_processes: number;
    process_efficiency_score: number;
    average_queue_time: number;
    process_analytics: Record<string, ProcessRuleReport>;
};

const ProductionAnalyticsDashboard: React.FC<ProductionAnalyticsDashboardProps> = ({ shiftId }) => {
    const { data: session } = useSession();
    const [productionReport, setProductionReport] = useState<ProductionReport | null>(null);
    const [topEmployees, setTopEmployees] = useState<EmployeeProcessMetrics[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProcessRule, setSelectedProcessRule] = useState<string | null>(null);

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

    const getTrendIcon = (value: number) => {
        return value > 0 ? <HiTrendingUp className="text-green-500" /> : <HiTrendingDown className="text-red-500" />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!productionReport) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">Nenhum dado de produção disponível para este turno.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header com métricas gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <HiClock className="text-blue-500 text-2xl mr-3" />
                        <div>
                            <p className="text-sm text-gray-600">Tempo Médio Processo</p>
                            <p className="text-xl font-semibold">{formatDuration(productionReport.average_process_time)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <HiUsers className="text-green-500 text-2xl mr-3" />
                        <div>
                            <p className="text-sm text-gray-600">Total Processos</p>
                            <p className="text-xl font-semibold">{productionReport.total_processes}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <HiChartBar className="text-purple-500 text-2xl mr-3" />
                        <div>
                            <p className="text-sm text-gray-600">Eficiência Geral</p>
                            <p className={`text-xl font-semibold ${getEfficiencyColor(productionReport.process_efficiency_score)}`}>
                                {formatPercentage(productionReport.process_efficiency_score)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <HiClock className="text-orange-500 text-2xl mr-3" />
                        <div>
                            <p className="text-sm text-gray-600">Tempo Médio Fila</p>
                            <p className="text-xl font-semibold">{formatDuration(productionReport.average_queue_time)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seletor de regra de processo */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Análise por Regra de Processo</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Object.entries(productionReport.process_analytics).map(([ruleName, analytics]) => (
                        (() => {
                            const typedAnalytics = analytics as ProcessRuleReport;
                            return (
                                <button
                                    key={typedAnalytics.process_rule_id}
                                    onClick={() => setSelectedProcessRule(selectedProcessRule === ruleName ? null : ruleName)}
                                    className={`p-3 rounded-lg border transition-colors ${
                                        selectedProcessRule === ruleName
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <p className="font-medium text-sm">{ruleName}</p>
                                    <p className="text-xs text-gray-600">{typedAnalytics.total_processes} processos</p>
                                </button>
                            );
                        })()
                    ))}
                </div>
            </div>

            {/* Detalhes da regra selecionada */}
            {selectedProcessRule && productionReport.process_analytics[selectedProcessRule] && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4">
                        {selectedProcessRule} - Detalhes
                    </h3>
                    
                    <ProcessRuleDetails analytics={productionReport.process_analytics[selectedProcessRule]} />
                </div>
            )}

            {/* Top funcionários */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">Top Funcionários</h3>
                <div className="space-y-3">
                    {topEmployees.map((employee, index) => (
                        <div key={"analytics-dashboard-"+employee.employee_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-blue-600 font-semibold">{index + 1}</span>
                                </div>
                                <div>
                                    <p className="font-medium">{employee.employee_name}</p>
                                    <p className="text-sm text-gray-600">
                                        {employee.total_processed} processos • {formatDuration(employee.average_process_time)} média
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-semibold ${getEfficiencyColor(employee.efficiency_score)}`}>
                                    {formatPercentage(employee.efficiency_score)}
                                </p>
                                <p className="text-xs text-gray-500">Eficiência</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface ProcessRuleDetailsProps {
    analytics: ProcessRuleReport;
}

const ProcessRuleDetails: React.FC<ProcessRuleDetailsProps> = ({ analytics }) => {
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

    return (
        <div className="space-y-6">
            {/* Métricas principais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{analytics.total_processes}</p>
                    <p className="text-sm text-gray-600">Total</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{analytics.completed_processes}</p>
                    <p className="text-sm text-gray-600">Completados</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{analytics.canceled_processes}</p>
                    <p className="text-sm text-gray-600">Cancelados</p>
                </div>
                <div className="text-center">
                    <p className={`text-2xl font-bold ${getEfficiencyColor(analytics.efficiency_score)}`}>
                        {formatPercentage(analytics.efficiency_score)}
                    </p>
                    <p className="text-sm text-gray-600">Eficiência</p>
                </div>
            </div>

            {/* Tempos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Tempos de Processo</h4>
                    <p className="text-sm text-gray-600">Médio: {formatDuration(analytics.average_process_time)}</p>
                    <p className="text-sm text-gray-600">Total: {formatDuration(analytics.total_process_time)}</p>
                    <p className="text-sm text-gray-600">Pausas: {analytics.total_paused_count}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Tempos de Fila</h4>
                    <p className="text-sm text-gray-600">Médio: {formatDuration(analytics.average_queue_time)}</p>
                    <p className="text-sm text-gray-600">Total: {formatDuration(analytics.total_queue_time)}</p>
                </div>
            </div>

            {/* Performance por categoria */}
            {Object.keys(analytics.categories_processed).length > 0 && (
                <div>
                    <h4 className="font-semibold mb-3">Performance por Categoria</h4>
                    <div className="space-y-2">
                        {Object.entries(analytics.categories_processed).map(([categoryId, category]) => (
                            (() => {
                                const typedCategory = category as { category_name: string; total_processed: number; average_process_time: number; canceled_count: number };
                                return (
                                    <div key={categoryId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{typedCategory.category_name}</p>
                                            <p className="text-sm text-gray-600">
                                                {typedCategory.total_processed} processados • {formatDuration(typedCategory.average_process_time)} média
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">{typedCategory.canceled_count} cancelados</p>
                                        </div>
                                    </div>
                                );
                            })()
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductionAnalyticsDashboard; 