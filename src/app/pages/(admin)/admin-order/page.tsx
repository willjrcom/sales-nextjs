'use client';

import ListReports from '@/app/components/report/list-reports';

export default function OrderAdminPage() {
  const reportIds = ['orders-by-status', 'orders-per-table', 'cancellation-rate', 'avg-process-step-duration'];
  return <ListReports name='Pedidos' reportIds={reportIds} />;
}