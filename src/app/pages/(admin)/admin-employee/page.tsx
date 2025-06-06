'use client';

import ShowReports from '@/app/components/report/show-reports';

export default function EmployeeAdminPage() {
  const reportIds = ['avg-delivery-time-by-driver', 'deliveries-per-driver', 'employee-payments-report'];
  return <ShowReports name='Funcionários' reportIds={reportIds} />;
}