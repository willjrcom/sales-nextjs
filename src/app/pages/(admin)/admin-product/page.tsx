'use client';

import ShowReports from '@/app/components/report/show-reports';

export default function ProductAdminPage() {
  const reportIds = [
    'products-sold-by-day',
    'top-products',
    'sales-by-category',
    'sales-by-size',
    'additional-items-sold',
  ];
  return <ShowReports name='Produtos' reportIds={reportIds} />;
}