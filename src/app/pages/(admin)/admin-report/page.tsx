import Link from 'next/link';
import PageTitle from '@/app/components/ui/page-title';
import { reportConfigs } from '@/app/components/report/report-configs';

export default function ReportsPage() {
  return (
    <div className="p-4 ml-52">
      <PageTitle title="Relatórios" tooltip="Selecione um relatório para visualizar." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportConfigs.map((c) => (
          <Link
            key={c.id}
            href={`/pages/admin-report/${c.id}`}
            className="p-4 bg-white rounded shadow hover:bg-gray-100"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
