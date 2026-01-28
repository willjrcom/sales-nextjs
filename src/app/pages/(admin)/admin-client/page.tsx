'use client';

import ListReports from '@/app/components/report/list-reports';

export default function ClientAdminPage() {
  const reportIds = ['clients-registered-by-day', 'new-vs-recurring-clients'];
  return <ListReports name='Clientes' reportIds={reportIds} />;
}