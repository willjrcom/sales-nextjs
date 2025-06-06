'use client';

import { useState } from 'react';
import PageTitle from '@/app/components/PageTitle';
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
            {reports.map((config) => <ReportCard config={config} date={date} setDate={setDate} key={config.id} />)}
        </div>
    );
}

export default ShowReports;