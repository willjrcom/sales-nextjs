'use client';

import ListReports from '@/app/components/report/list-reports';

export default function EmployeeAdminPage() {
  const reportIds = ['avg-delivery-time-by-driver', 'deliveries-per-driver', 'employee-payments-report'];
  return <ListReports name='Funcionários' reportIds={reportIds} />;
}