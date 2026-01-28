'use client';

import ListReports from '@/app/components/report/list-reports';

export default function ShiftAdminPage() {
  const reportIds = ['sales-by-shift'];
  return <ListReports name='Turnos' reportIds={reportIds} />;
}