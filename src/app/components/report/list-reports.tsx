'use client';

import { useState } from 'react';
import PageTitle from '@/app/components/ui/page-title';
import { reportConfigs, ReportConfig } from '@/app/components/report/report-configs';
import ReportCard from './report-card';
import { FilterDateProps } from './filter';
import ThreeColumnHeader from '@/components/header/three-column-header';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

interface ListReportsProps {
    name: string;
    reportIds: string[];
}

const ListReports = ({ name, reportIds }: ListReportsProps) => {
    const reports = reportConfigs.filter((c: ReportConfig) => reportIds.includes(c.id));
    const today = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const initialDate = { start: thirtyDaysAgo, end: today } as FilterDateProps;
    const [date, setDate] = useState(initialDate);

    return (
        <div className="p-4 flex flex-col gap-6">
            <Link
                href="/pages/admin-report"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-rose-500 transition-colors w-fit"
            >
                <FaArrowLeft size={12} /> Voltar ao Painel
            </Link>

            <ThreeColumnHeader center={<PageTitle title={name} tooltip={"Relatórios de " + name} />} />
            {reportIds.length == 0 && <p>Nenhum relatório disponível</p>}

            {/* Grid responsivo: 1 coluna em mobile, 2 colunas em desktop */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {reports.map((config: ReportConfig) => (
                    <div key={config.id} className="w-full">
                        <ReportCard config={config} date={date} setDate={setDate} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ListReports;