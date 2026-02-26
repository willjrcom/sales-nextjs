"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import PageTitle from '@/app/components/ui/page-title';
import Tooltip from '@/app/components/ui/tooltip';
import { reportConfigs, ReportConfig } from '@/app/components/report/report-configs';
import ThreeColumnHeader from '@/components/header/three-column-header';
import ReportChart from '@/app/components/report/report-chart';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FaUserTie,
  FaPlus,
  FaTh,
  FaClock,
  FaChartBar,
  FaCalendarAlt,
} from "react-icons/fa";
import { TiFlowMerge } from "react-icons/ti";
import { MdFastfood } from "react-icons/md";
import { BsFillPeopleFill } from "react-icons/bs";

const adminPages = [
  { label: "Processos", icon: TiFlowMerge, href: "/pages/admin-order-process" },
  { label: "Cardápio", icon: MdFastfood, href: "/pages/admin-product" },
  { label: "Clientes", icon: BsFillPeopleFill, href: "/pages/admin-client" },
  { label: "Funcionários", icon: FaUserTie, href: "/pages/admin-employee" },
  { label: "Mesas", icon: FaTh, href: "/pages/admin-place" },
  { label: "Pedidos", icon: FaPlus, href: "/pages/admin-order" },
  { label: "Turnos", icon: FaClock, href: "/pages/admin-shift" },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportConfig | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  const groupedReports = reportConfigs.reduce((acc, report) => {
    if (!acc[report.category]) acc[report.category] = [];
    acc[report.category].push(report);
    return acc;
  }, {} as Record<string, typeof reportConfigs>);

  const handleOpenReport = (report: ReportConfig) => {
    setSelectedReport(report);
  };

  const chartBody = selectedReport?.inputType === 'dateRange'
    ? { start: new Date(startDate).toISOString(), end: new Date(endDate).toISOString() }
    : selectedReport?.inputType === 'date'
      ? { day: new Date(startDate).toISOString() }
      : undefined;

  return (
    <div className="flex flex-col gap-8 p-4">
      <ThreeColumnHeader center={<PageTitle title="Painel Admin" tooltip="Gestão e Relatórios." />} />

      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaPlus className="text-rose-500" /> Gestão Administrativa
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {adminPages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border hover:border-rose-500 hover:shadow-md transition-all group text-center"
            >
              <page.icon className="text-2xl mb-2 text-gray-600 group-hover:text-rose-500" />
              <span className="text-sm font-medium text-gray-700">{page.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FaChartBar className="text-rose-500" /> Relatórios e Indicadores
        </h2>
        <div className="flex flex-col gap-8">
          {Object.entries(groupedReports).map(([category, reports]) => (
            <div key={category} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 border-b pb-2">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {reports.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleOpenReport(c)}
                    className="p-4 bg-white rounded-lg border shadow-sm hover:border-rose-500 hover:bg-rose-50 transition-colors flex items-center justify-between group text-left"
                  >
                    <span className="text-sm font-medium text-gray-800">{c.name}</span>
                    <Tooltip content={`Ver detalhes de ${c.name}`}>
                      <FaChartBar className="text-gray-300 group-hover:text-rose-400" />
                    </Tooltip>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FaChartBar className="text-rose-500" /> {selectedReport?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6 py-4">
            {selectedReport?.inputType !== 'none' && (
              <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-lg border">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <FaCalendarAlt size={10} /> {selectedReport?.inputType === 'dateRange' ? 'Início' : 'Data'}
                  </span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border rounded px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                  />
                </div>
                {selectedReport?.inputType === 'dateRange' && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <FaCalendarAlt size={10} /> Fim
                    </span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border rounded px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="bg-white p-6 rounded-xl border shadow-sm h-[400px] flex items-center justify-center">
              {selectedReport && (
                <div className="w-full h-full">
                  <ReportChart
                    endpoint={selectedReport.endpoint}
                    method={selectedReport.method}
                    body={chartBody}
                    chartType={selectedReport.chartType}
                    labelKey={selectedReport.labelKey}
                    dataKey={selectedReport.dataKey}
                    title={selectedReport.name}
                  />
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

