'use client';

import ListReports from '@/app/components/report/list-reports';

export default function ProductAdminPage() {
  const reportIds = [
    'products-sold-by-day',
    'complement-items-sold',
    'additional-items-sold',
    'top-products',
    'sales-by-category',
    'sales-by-size',
  ];
  return <ListReports name='Produtos' reportIds={reportIds} />;
}
