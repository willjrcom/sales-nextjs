'use client';

import ShowReports from '@/app/components/report/show-reports';

export default function PlaceAdminPage() {
  const reportIds = ['sales-by-place', 'top-tables'];
  return <ShowReports name='Lugares' reportIds={reportIds} />;
}