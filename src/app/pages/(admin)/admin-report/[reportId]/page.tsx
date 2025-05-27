'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReportChart from '@/app/components/report/ReportChart';
import PageTitle from '@/app/components/PageTitle';
import { reportConfigs } from '@/app/components/report/reportConfigs';

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.reportId;
  const config = reportConfigs.find((c) => c.id === reportId);
  if (!config) {
    return <div className="p-4 ml-52">Relatório não encontrado.</div>;
  }
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const body = config.inputType === 'dateRange'
      ? { start: new Date(startDate).toISOString(), end: new Date(endDate).toISOString() }
      : config.inputType === 'date'
      ? { day: new Date(startDate).toISOString() }
      : undefined;

  return (
    <div className="p-4 ml-52">
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-600 hover:underline"
      >
        &larr; Voltar
      </button>
      <PageTitle title={config.name} tooltip={`Relatório: ${config.name}`} />
      {config.inputType !== 'none' && (
        <div className="mb-4 flex gap-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
          {config.inputType === 'dateRange' && (
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-2 rounded"
            />
          )}
        </div>
      )}
      <div className="bg-white p-4 rounded shadow">
        <ReportChart
          endpoint={config.endpoint}
          method={config.method}
          body={body}
          chartType={config.chartType}
          labelKey={config.labelKey}
          dataKey={config.dataKey}
          title={config.name}
        />
      </div>
    </div>
  );
}