'use client';

import { useState } from 'react';
import ReportChart from '@/app/components/report/ReportChart';
import PageTitle from '@/app/components/PageTitle';
import { reportConfigs } from '@/app/components/report/reportConfigs';

export default function ReportsPage() {
  const [selectedReportId, setSelectedReportId] = useState(reportConfigs[0].id);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const config = reportConfigs.find((c) => c.id === selectedReportId)!;
  const body =
    config.inputType === 'dateRange'
      ? { start: new Date(startDate).toISOString(), end: new Date(endDate).toISOString() }
      : config.inputType === 'date'
        ? { day: new Date(startDate).toISOString() }
        : undefined;

  return (
    <div className="p-4 ml-52">
      <PageTitle title="Relatórios" tooltip="Visualize relatórios administrativos de vendas, desempenho e métricas." />
      <div className="mb-4 flex gap-4">
        <select
          value={selectedReportId}
          onChange={(e) => setSelectedReportId(e.target.value)}
          className="border p-2 rounded"
        >
          {reportConfigs.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {config.inputType !== 'none' && (
          <div className="flex gap-2">
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
      </div>
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