'use client';

import ShowReports from '@/app/components/report/show-reports';

export default function ProductAdminPage() {
  const reportIds = [
    'products-sold-by-day',
    'top-products',
    'sales-by-category',
    'sales-by-size',
    'additional-items-sold',
    // Profitability reports
    'product-profitability',
    'category-profitability',
    'low-profit-products',
    'overall-profitability',
  ];
  return <ShowReports name='Produtos' reportIds={reportIds} />;
}