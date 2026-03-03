'use client';

import ListReports from '@/app/components/report/list-reports';

export default function ProductAdminPage() {
  const reportIds = [
    'products-sold-by-day',
    'top-products',
    'sales-by-category',
    'sales-by-size',
    'additional-items-sold',
    'complement-items-sold',
  ];
  return <ListReports name='Produtos' reportIds={reportIds} />;
}
