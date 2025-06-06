'use client';

import ShowReports from '@/app/components/report/show-reports';

export default function ClientAdminPage() {
  const reportIds = ['clients-registered-by-day', 'new-vs-recurring-clients'];
  return <ShowReports name='Clientes' reportIds={reportIds} />;
}