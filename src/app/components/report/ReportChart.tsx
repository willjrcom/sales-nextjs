'use client';

import { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import RequestApi, { AddAccessToken } from '@/app/api/request';
import { useSession } from 'next-auth/react';
import GetCompany from '@/app/api/company/company';
import Company from '@/app/entities/company/company';

Chart.register(...registerables);

interface ReportChartProps {
  endpoint: string;
  method?: 'GET' | 'POST';
  body?: Record<string, any>;
  queryParams?: Record<string, any>;
  chartType?: 'line' | 'bar' | 'pie';
  labelKey: string;
  dataKey: string;
  title?: string;
}

export default function ReportChart({
  endpoint,
  method = 'GET',
  body,
  queryParams,
  chartType = 'line',
  labelKey,
  dataKey,
  title,
}: ReportChartProps) {
  const { data: sessionData } = useSession();
  const [company, setCompany] = useState<Company | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionData) {
      GetCompany(sessionData)
        .then(setCompany)
        .catch(() => setError('Error fetching company'));
    }
  }, [sessionData]);

  useEffect(() => {
    async function fetchData() {
      if (!sessionData || !company) return;
      setLoading(true);
      setError(null);
      try {
        const schema = company.schema_name;
        let path = endpoint;
        let reqBody = body;
        const headers = await AddAccessToken(sessionData);
        if (method === 'GET') {
          const params = { schema, ...(queryParams || {}) };
          const query = new URLSearchParams(
            params as Record<string, string>
          ).toString();
          path = `${endpoint}?${query}`;
        } else {
          reqBody = { schema, ...(body || {}) };
        }
        const response = await RequestApi<Record<string, any>, any[]>({
          path,
          method,
          body: reqBody,
          headers,
        });
        const data = response.data;
        const newLabels = data.map((item) => {
          const v = item[labelKey];
          return v instanceof Date ? v.toISOString() : String(v);
        });
        const newValues = data.map((item) => Number(item[dataKey]));
        setLabels(newLabels);
        setValues(newValues);
      } catch (err: any) {
        setError(err?.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [
    sessionData,
    company,
    endpoint,
    method,
    JSON.stringify(body),
    JSON.stringify(queryParams),
    labelKey,
    dataKey,
  ]);

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
      },
    ],
  };

  const ChartComponent =
    chartType === 'line' ? Line : chartType === 'bar' ? Bar : Pie;
  return <ChartComponent data={chartData} />;
}