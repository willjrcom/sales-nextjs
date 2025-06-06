'use client';

import ShowReports from '@/app/components/report/show-reports';

export default function OrderAdminPage() {
  const reportIds = ['orders-by-status', 'orders-per-table', 'cancellation-rate', 'avg-process-step-duration'];
  return <ShowReports name='Pedidos' reportIds={reportIds} />;
}