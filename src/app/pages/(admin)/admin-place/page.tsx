'use client';

import ListReports from '@/app/components/report/list-reports';

export default function PlaceAdminPage() {
  const reportIds = ['sales-by-place', 'top-tables'];
  return <ListReports name='Lugares' reportIds={reportIds} />;
}