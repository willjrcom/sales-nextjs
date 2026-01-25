"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import {
  getMonthlyCostSummary,
  getCostBreakdown,
  enableFiscalInvoices,
  disableFiscalInvoices,
  getNextInvoicePreview,
  type MonthlyCostSummary,
  type CostBreakdown,
  type NextInvoicePreview,
} from "@/app/api/company/costs";
import { listInvoices, type FiscalInvoice } from "@/app/api/fiscal/invoices";
import GetCompany from "@/app/api/company/company";
import Company from "@/app/entities/company/company";
import FiscalActivationModal from "@/app/components/modal/FiscalActivationModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const InfoCard = ({
  title,
  value,
  helper,
  variant = "default",
}: {
  title: string;
  value: string;
  helper?: string;
  variant?: "default" | "info" | "success";
}) => {
  const variantClasses: Record<string, string> = {
    default: "border-gray-200",
    info: "border-blue-200 bg-blue-50",
    success: "border-green-200 bg-green-50",
  };
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${variantClasses[variant]}`}
    >
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      {helper && <p className="text-sm text-gray-600 mt-1">{helper}</p>}
    </div>
  );
};

const CompanyBillingPage = () => {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<MonthlyCostSummary | null>(null);
  const [breakdown, setBreakdown] = useState<CostBreakdown | null>(null);
  const [invoices, setInvoices] = useState<FiscalInvoice[]>([]);
  const [nextInvoice, setNextInvoice] = useState<NextInvoicePreview | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [fiscalLoading, setFiscalLoading] = useState(false);
  const [showFiscalModal, setShowFiscalModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: company } = useQuery({
    queryKey: ['company'],
    queryFn: () => GetCompany(session!),
    enabled: !!session?.user.access_token,
  })

  const loadNextInvoice = useCallback(async () => {
    if (!session) return;
    try {
      const data = await getNextInvoicePreview(session);
      setNextInvoice(data);
    } catch (error: any) {
      // Silently fail - preview is optional, don't block the page
      console.warn("Could not load next invoice preview:", error?.message || error);
      setNextInvoice(null);
    }
  }, [session]);

  const loadCosts = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [summaryData, breakdownData] = await Promise.all([
        getMonthlyCostSummary(session, selectedMonth, selectedYear),
        getCostBreakdown(session, selectedMonth, selectedYear),
      ]);
      setSummary(summaryData);
      setBreakdown(breakdownData);
    } catch (error: any) {
      notifyError(error?.message ?? "Não foi possível carregar os custos.");
    } finally {
      setLoading(false);
    }
  }, [session, selectedMonth, selectedYear]);

  const loadInvoices = useCallback(async () => {
    if (!session) return;
    try {
      const { items } = await listInvoices(session, 1, 5);
      setInvoices(items);
    } catch (error: any) {
      // Silent fail - invoices are optional
      console.error("Failed to load invoices:", error);
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    loadInvoices();
    loadNextInvoice();
  }, [session, loadInvoices, loadNextInvoice]);


  useEffect(() => {
    if (!session) return;
    loadCosts();
  }, [session, selectedMonth, selectedYear, loadCosts]);

  const handleToggleFiscal = async () => {
    if (!session || !company) return;

    // If enabling, show confirmation modal
    if (!company.fiscal_enabled) {
      setShowFiscalModal(true);
      return;
    }

    // If disabling, show warning and proceed
    if (window.confirm("A cobrança continuará até o fim do mês atual. Deseja desativar?")) {
      setFiscalLoading(true);
      try {
        await disableFiscalInvoices(session);
        notifySuccess("Emissão de notas fiscais desabilitada. A cobrança continua até o fim do mês.");
        queryClient.invalidateQueries({ queryKey: ['company'] });
      } catch (error: any) {
        notifyError(
          error?.message ?? "Não foi possível desativar o serviço fiscal.",
        );
      } finally {
        setFiscalLoading(false);
      }
    }
  };

  const handleConfirmFiscalActivation = async () => {
    if (!session) return;
    setFiscalLoading(true);
    try {
      await enableFiscalInvoices(session);
      notifySuccess("Emissão de notas fiscais habilitada!");
      queryClient.invalidateQueries({ queryKey: ['company'] });
      await loadNextInvoice(); // Reload invoice preview to show new fee
    } catch (error: any) {
      notifyError(
        error?.message ?? "Não foi possível ativar o serviço fiscal.",
      );
      throw error; // Re-throw to let modal handle loading state
    } finally {
      setFiscalLoading(false);
    }
  };

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const statusBadgeClass = company?.fiscal_enabled
    ? "bg-green-100 text-green-700"
    : "bg-gray-100 text-gray-700";

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    authorized: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-700",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    authorized: "Autorizada",
    rejected: "Rejeitada",
    cancelled: "Cancelada",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Billing & Notas Fiscais</h1>
            <p className="text-gray-500">
              Acompanhe seus custos mensais e gerencie notas fiscais eletrônicas.
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${statusBadgeClass}`}
          >
            {company?.fiscal_enabled
              ? "Fiscal habilitado"
              : "Fiscal desabilitado"}
          </span>
        </div>

        {/* Next Invoice Preview Card */}
        {nextInvoice && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                <h2 className="text-xl font-semibold text-gray-800">Próxima Fatura</h2>
              </div>
              <span className="text-sm text-gray-600">
                Cobrança em: {new Date(nextInvoice.next_billing_date + "T00:00:00").toLocaleDateString("pt-BR")}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {nextInvoice.enabled_services.map((service, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-indigo-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <span className={service.enabled ? "text-green-500" : "text-gray-400"}>
                      {service.enabled ? "✅" : "❌"}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{service.name}</p>
                      <p className="text-xs text-gray-500">{service.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {service.enabled ? (
                      <>
                        <p className="font-semibold text-gray-800">
                          {currencyFormatter.format(
                            parseFloat(String(service.fixed_cost)) + parseFloat(String(service.usage_cost))
                          )}
                        </p>
                        {service.usage_count !== undefined && service.usage_count > 0 && (
                          <p className="text-xs text-gray-500">
                            {service.usage_count} × {currencyFormatter.format(parseFloat(String(service.unit_cost || 0)))}
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400 text-sm">Desativado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-indigo-200">
              <span className="text-lg font-semibold text-gray-700">Total Estimado:</span>
              <span className="text-2xl font-bold text-indigo-600">
                {currencyFormatter.format(parseFloat(String(nextInvoice.estimated_total)))}
              </span>
            </div>
          </div>
        )}

        {/* Fallback when preview fails to load */}
        {!nextInvoice && company?.fiscal_enabled && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 text-gray-600">
              <span className="text-2xl">ℹ️</span>
              <div>
                <p className="font-medium">Prévia da Fatura Indisponível</p>
                <p className="text-sm text-gray-500 mt-1">
                  Não foi possível carregar a prévia da próxima fatura. Verifique se o backend está rodando.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Month/Year Selector */}

        <div className="flex gap-3 items-center">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            {months.map((month, idx) => (
              <option key={idx} value={idx + 1}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            {[2024, 2025, 2026, 2027].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <button
            onClick={loadCosts}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Carregando..." : "Atualizar"}
          </button>
        </div>

        {/* Cost Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard
            title="Total do mês"
            value={
              summary
                ? currencyFormatter.format(parseFloat(String(summary.total_amount)))
                : "R$ 0,00"
            }
            helper={`${summary?.costs_count ?? 0} transações`}
            variant="info"
          />
          <InfoCard
            title="Assinatura"
            value={
              summary
                ? currencyFormatter.format(
                  parseFloat(String(summary.subscription_fee)),
                )
                : "R$ 0,00"
            }
            helper="Plano mensal"
          />
          <InfoCard
            title="NFC-e emitidas"
            value={`${summary?.nfce_count ?? 0}`}
            helper={
              summary
                ? currencyFormatter.format(parseFloat(String(summary.nfce_costs)))
                : "R$ 0,00"
            }
            variant="success"
          />
        </div>
      </div>

      {/* Fiscal Toggle Section */}
      <section className="rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">Configuração Fiscal</h2>
        <p className="text-sm text-gray-600">
          Habilite a emissão de notas fiscais eletrônicas (NFC-e) para seus
          pedidos. Custo: R$ 0,10 por nota emitida.
        </p>
        {!company?.fiscal_enabled && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
            ⚠️ Certifique-se de preencher os dados fiscais da empresa antes de
            habilitar (IE, Regime Tributário, CNAE, credenciais Transmitenota).
          </div>
        )}
        <button
          onClick={handleToggleFiscal}
          disabled={fiscalLoading}
          className={`px-6 py-3 rounded-md font-medium transition ${company?.fiscal_enabled
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-green-600 hover:bg-green-700 text-white"
            } disabled:opacity-50`}
        >
          {fiscalLoading
            ? "Processando..."
            : company?.fiscal_enabled
              ? "Desabilitar emissão de notas"
              : "Habilitar emissão de notas"}
        </button>
      </section>

      {/* Cost Breakdown */}
      {breakdown && breakdown.costs.length > 0 && (
        <section className="rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Detalhamento de Custos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Data</th>
                  <th className="px-4 py-2 text-left">Tipo</th>
                  <th className="px-4 py-2 text-left">Descrição</th>
                  <th className="px-4 py-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.costs.map((cost) => (
                  <tr key={cost.id} className="border-t">
                    <td className="px-4 py-2">
                      {new Date(cost.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {cost.cost_type}
                      </span>
                    </td>
                    <td className="px-4 py-2">{cost.description}</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {currencyFormatter.format(parseFloat(String(cost.amount)))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-right">
                    Total:
                  </td>
                  <td className="px-4 py-2 text-right">
                    {currencyFormatter.format(
                      parseFloat(breakdown.total_amount),
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}

      {/* Recent Invoices */}
      {invoices.length > 0 && (
        <section className="rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Últimas Notas Fiscais</h2>
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div>
                  <p className="font-medium">
                    NFC-e #{invoice.numero} - Série {invoice.serie}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(invoice.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}
                >
                  {statusLabels[invoice.status]}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fiscal Activation Modal */}
      <FiscalActivationModal
        isOpen={showFiscalModal}
        onClose={() => setShowFiscalModal(false)}
        onConfirm={handleConfirmFiscalActivation}
      />
    </div>
  );
};


export default CompanyBillingPage;
