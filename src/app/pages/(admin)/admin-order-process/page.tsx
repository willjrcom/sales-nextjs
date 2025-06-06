'use client';

import ShowReports from '@/app/components/report/show-reports';

export default function OrderProcessAdminPage() {
  const reportIds = ['avg-process-step-duration', 'processed-count-by-rule', 'avg-process-duration-by-product', 'total-queue-time-by-group-item'];
  return <ShowReports name='Processos' reportIds={reportIds} />;
}