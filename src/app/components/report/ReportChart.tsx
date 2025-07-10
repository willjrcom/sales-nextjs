'use client';

import { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import RequestApi, { AddAccessToken } from '@/app/api/request';
import { useSession } from 'next-auth/react';
import GetCompany from '@/app/api/company/company';
import Company from '@/app/entities/company/company';
import { notifyError } from '@/app/utils/notifications';
import RequestError from '@/app/utils/error';

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

  useEffect(() => {
    if (sessionData) {
      GetCompany(sessionData)
        .then(setCompany)
        .catch(() => notifyError('Error fetching company'));
    }
  }, [sessionData]);

  useEffect(() => {
    async function fetchData() {
      if (!sessionData || !company) return;
      setLoading(true);
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
        const response = await RequestApi<Record<string, any>, any[] | any>({
          path,
          method,
          body: reqBody,
          headers,
        });
        const data = response.data;
        
        // Handle both array and single object responses
        let newLabels: string[] = [];
        let newValues: number[] = [];
        
        if (Array.isArray(data)) {
          // Array response (most reports)
          newLabels = data.map((item) => {
            const v = item[labelKey];
            return v instanceof Date ? v.toISOString() : String(v);
          });
          newValues = data.map((item) => {
            const value = item[dataKey];
            // Handle null/undefined values for profitability reports
            if (value === null || value === undefined) {
              return 0;
            }
            return Number(value);
          });
        } else {
          // Single object response (like overall-profitability)
          const value = data[dataKey];
          const label = data[labelKey];
          newLabels = [label instanceof Date ? label.toISOString() : String(label)];
          newValues = [value === null || value === undefined ? 0 : Number(value)];
        }
        
        setLabels(newLabels);
        setValues(newValues);
      } catch (err: RequestError | any) {
        notifyError(err?.message || 'Error fetching data');
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