'use client';

import { useState } from 'react';
import PageTitle from '@/app/components/ui/page-title';
import ReportChart from '@/app/components/report/ReportChart';
import { reportConfigs } from '@/app/components/report/reportConfigs';
import ReportCard from './report';
import { FilterDateProps } from './filter';

interface ReportProps {
    name: string;
    reportIds: string[];
}

const ShowReports = ({ name, reportIds }: ReportProps) => {
    const reports = reportConfigs.filter((c) => reportIds.includes(c.id));
    const today = new Date().toISOString().slice(0, 10);
    const initialDate = { start: today, end: today } as FilterDateProps;
    const [date, setDate] = useState(initialDate);

    return (
        <div className="p-4 ml-52">
            <PageTitle title={name} tooltip={"Relatórios de " + name} />
            {reportIds.length == 0 && <p>Nenhum relatório disponível</p>}

            {/* Grid responsivo: 1 coluna em mobile, 2 colunas em desktop */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {reports.map((config) => (
                    <div key={config.id} className="w-full">
                        <ReportCard config={config} date={date} setDate={setDate} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ShowReports;