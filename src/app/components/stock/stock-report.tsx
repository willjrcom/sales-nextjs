'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Decimal from 'decimal.js';

const StockReport = () => {
    const stockSlice = useSelector((state: RootState) => state.stock);
    const report = stockSlice.report;

    if (!report) {
        return (
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Relatório de Estoque</h2>
                <p>Nenhum dado disponível</p>
            </div>
        );
    }

    const summary = report.summary || {};
    const topProducts = report.top_products || [];
    const lowStockProducts = report.low_stock_products || [];

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Relatório de Estoque</h2>
            
            {/* Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Total de Produtos</h3>
                    <p className="text-2xl font-bold text-blue-900">{summary.total_products || 0}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800">Em Estoque</h3>
                    <p className="text-2xl font-bold text-green-900">{summary.in_stock || 0}</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800">Estoque Baixo</h3>
                    <p className="text-2xl font-bold text-yellow-900">{summary.low_stock || 0}</p>
                </div>
                <div className="bg-red-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800">Sem Estoque</h3>
                    <p className="text-2xl font-bold text-red-900">{summary.out_of_stock || 0}</p>
                </div>
            </div>

            {/* Produtos com Mais Estoque */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Produtos com Mais Estoque</h3>
                <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Produto</th>
                                <th className="px-4 py-2 text-left">Estoque Atual</th>
                                <th className="px-4 py-2 text-left">Unidade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProducts.map((product: any, index: number) => (
                                <tr key={index} className="border-t">
                                    <td className="px-4 py-2">{product.name}</td>
                                    <td className="px-4 py-2">{new Decimal(product.current_stock).toFixed(2)}</td>
                                    <td className="px-4 py-2">{product.unit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Produtos com Estoque Baixo */}
            <div>
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
                            {lowStockProducts.map((product: any, index: number) => (
                                <tr key={index} className="border-t">
                                    <td className="px-4 py-2">{product.name}</td>
                                    <td className="px-4 py-2 text-red-600 font-semibold">
                                        {new Decimal(product.current_stock).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-2">{new Decimal(product.min_stock).toFixed(2)}</td>
                                    <td className="px-4 py-2">{product.unit}</td>
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