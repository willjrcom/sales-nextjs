'use client';

import React from 'react';
import Decimal from 'decimal.js';
import { StockReportComplete } from '@/app/entities/stock/stock-report';

interface StockReportCompleteProps {
    reportStock: StockReportComplete;
}

const StockReport = ({ reportStock }: StockReportCompleteProps) => {
    if (!reportStock) {
        return (
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Relatório de Estoque</h2>
                <p>Nenhum dado disponível</p>
            </div>
        );
    }

    if (!reportStock) {
        return (
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Relatório de Estoque</h2>
                <p>Nenhum dado disponível</p>
            </div>
        );
    }

    const summary = reportStock.summary;
    const allStocks = reportStock.all_stocks || [];
    const lowStockProducts = reportStock.low_stock_products || [];
    const outOfStockProducts = reportStock.out_of_stock_products || [];

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Relatório de Estoque</h2>

            {/* Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Total de Produtos</h3>
                    <p className="text-2xl font-bold text-blue-900">{summary.total_products}</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800">Estoque Baixo</h3>
                    <p className="text-2xl font-bold text-yellow-900">{summary.total_low_stock}</p>
                </div>
                <div className="bg-red-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800">Sem Estoque</h3>
                    <p className="text-2xl font-bold text-red-900">{summary.total_out_of_stock}</p>
                </div>
                <div className="bg-orange-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-orange-800">Alertas Ativos</h3>
                    <p className="text-2xl font-bold text-orange-900">{summary.total_active_alerts}</p>
                </div>
            </div>

            {/* Todos os Produtos */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Todos os Produtos</h3>
                <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Produto</th>
                                <th className="px-4 py-2 text-left">Estoque Atual</th>
                                <th className="px-4 py-2 text-left">Estoque Mínimo</th>
                                <th className="px-4 py-2 text-left">Estoque Máximo</th>
                                <th className="px-4 py-2 text-left">Unidade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allStocks.map((stock, index) => (
                                <tr key={index} className="border-t">
                                    <td className="px-4 py-2">{stock.product?.name || 'Produto não encontrado'}</td>
                                    <td className="px-4 py-2">{new Decimal(stock.current_stock).toFixed(2)}</td>
                                    <td className="px-4 py-2">{new Decimal(stock.min_stock).toFixed(2)}</td>
                                    <td className="px-4 py-2">{new Decimal(stock.max_stock).toFixed(2)}</td>
                                    <td className="px-4 py-2">{stock.unit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Produtos com Estoque Baixo */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Produtos com Estoque Baixo</h3>
                <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Produto</th>
                                <th className="px-4 py-2 text-left">Estoque Atual</th>
                                <th className="px-4 py-2 text-left">Estoque Mínimo</th>
                                <th className="px-4 py-2 text-left">Unidade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowStockProducts.map((stock, index) => (
                                <tr key={index} className="border-t">
                                    <td className="px-4 py-2">{stock.product?.name || 'Produto não encontrado'}</td>
                                    <td className="px-4 py-2 text-yellow-600 font-semibold">
                                        {new Decimal(stock.current_stock).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-2">{new Decimal(stock.min_stock).toFixed(2)}</td>
                                    <td className="px-4 py-2">{stock.unit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Produtos Sem Estoque */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Produtos Sem Estoque</h3>
                <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Produto</th>
                                <th className="px-4 py-2 text-left">Estoque Atual</th>
                                <th className="px-4 py-2 text-left">Estoque Mínimo</th>
                                <th className="px-4 py-2 text-left">Unidade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {outOfStockProducts.map((stock, index) => (
                                <tr key={index} className="border-t">
                                    <td className="px-4 py-2">{stock.product?.name || 'Produto não encontrado'}</td>
                                    <td className="px-4 py-2 text-red-600 font-semibold">
                                        {new Decimal(stock.current_stock).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-2">{new Decimal(stock.min_stock).toFixed(2)}</td>
                                    <td className="px-4 py-2">{stock.unit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StockReport; 