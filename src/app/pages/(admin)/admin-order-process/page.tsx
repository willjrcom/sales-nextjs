'use client';

import ListReports from '@/app/components/report/list-reports';

export default function OrderProcessAdminPage() {
  const reportIds = ['avg-process-step-duration', 'processed-count-by-rule', 'avg-process-duration-by-product', 'total-queue-time-by-group-item'];
  return <ListReports name='Processos' reportIds={reportIds} />;
}