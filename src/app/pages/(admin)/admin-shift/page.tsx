'use client';

import ShowReports from '@/app/components/report/show-reports';

export default function ShiftAdminPage() {
  const reportIds = ['sales-by-shift'];
  return <ShowReports name='Turnos' reportIds={reportIds} />;
}