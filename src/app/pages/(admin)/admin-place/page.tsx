'use client';

import { useState } from 'react';
import PageTitle from '@/app/components/PageTitle';
import ReportChart from '@/app/components/report/ReportChart';
import { reportConfigs } from '@/app/components/report/reportConfigs';

export default function PlaceAdminPage() {
  const reportIds = ['sales-by-place', 'top-tables'];
  const placeReports = reportConfigs.filter((c) => reportIds.includes(c.id));
  const today = new Date().toISOString().slice(0, 10);
  const initialDates = placeReports.reduce((acc, cur) => {
    acc[cur.id] = { start: today, end: today };
    return acc;
  }, {} as Record<string, { start: string; end: string }>);
  const [dates, setDates] = useState(initialDates);

  return (
    <div className="p-4 ml-52">
      <PageTitle title="Locais" tooltip="Relatórios de Vendas por Local" />
      {placeReports.map((config) => {
        const dt = dates[config.id];
        const body =
          config.inputType === 'dateRange'
            ? { start: new Date(dt.start).toISOString(), end: new Date(dt.end).toISOString() }
            : config.inputType === 'date'
            ? { day: new Date(dt.start).toISOString() }
            : undefined;

        return (
          <div key={config.id} className="mb-8">
            <h2 className="text-xl font-semibold mb-2">{config.name}</h2>
            {config.inputType !== 'none' && (
              <div className="flex gap-2 mb-2">
                <input
                  type="date"
                  className="border p-2 rounded"
                  value={dt.start}
                  onChange={(e) =>
                    setDates({ ...dates, [config.id]: { ...dt, start: e.target.value } })
                  }
                />
                {config.inputType === 'dateRange' && (
                  <input
                    type="date"
                    className="border p-2 rounded"
                    value={dt.end}
                    onChange={(e) =>
                      setDates({ ...dates, [config.id]: { ...dt, end: e.target.value } })
                    }
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
      })}
    </div>
  );
}
