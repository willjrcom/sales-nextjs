"use client";

import Decimal from "decimal.js";
import Shift from "@/app/entities/shift/shift";

interface CategorySummaryProps {
  shift: Shift;
}

const CategorySummary = ({ shift }: CategorySummaryProps) => {
  const salesCategories = Object.keys(shift.sales_by_category || {});
  const productCategories = Object.keys(shift.products_sold_by_category || {});
  const categories = Array.from(
    new Set([...salesCategories, ...productCategories])
  );
  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Vendas por Categoria</h3>
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="pb-2">Categoria</th>
              <th className="pb-2">Vendas (R$)</th>
              <th className="pb-2">Itens Vendidos</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="py-2 text-center">Nenhuma categoria encontrada</td>
              </tr>
            )}
            {categories.map((category) => {
              const salesValue = shift.sales_by_category[category] || new Decimal(0);
              const itemsSold = shift.products_sold_by_category[category] || 0;
              return (
                <tr key={category} className="border-t">
                  <td className="py-2">{category}</td>
                  <td className="py-2">R$ {new Decimal(salesValue).toFixed(2)}</td>
                  <td className="py-2">{itemsSold}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategorySummary;