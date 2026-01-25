"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from "@/app/components/PageTitle";
import CrudTable from "@/app/components/crud/table";
import Refresh from "@/app/components/crud/refresh";
import CompanyPaymentColumns from "@/app/entities/company/company-payment-columns";
import CompanyPayment from "@/app/entities/company/company-payment";
import Company from "@/app/entities/company/company";
import SubscriptionSettings from "@/app/entities/company/subscription-settings";
import {
  listCompanyPayments,
  createSubscriptionCheckout,
  getSubscriptionSettings,
} from "@/app/api/company/payments";
import GetCompany from "@/app/api/company/company";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { useQuery } from "@tanstack/react-query";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const preferSandboxCheckout =
  process.env.NEXT_PUBLIC_MP_ENV === "sandbox" ||
  process.env.NODE_ENV !== "production";

const InfoCard = ({
  title,
  value,
  helper,
  variant = "default",
}: {
  title: string;
  value: string;
  helper?: string;
  variant?: "default" | "danger" | "success";
}) => {
  const variantClasses: Record<string, string> = {
    default: "border-gray-200",
    danger: "border-red-200 bg-red-50",
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

const CompanyPaymentPage = () => {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<CompanyPayment[]>([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [settings, setSettings] = useState<SubscriptionSettings | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [months, setMonths] = useState(1);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const { data: company } = useQuery({
    queryKey: ['company'],
    queryFn: () => GetCompany(session!),
    enabled: !!session?.user.access_token,
  })

  const loadSettings = useCallback(async () => {
    if (!session) return;
    try {
      const response = await getSubscriptionSettings(session);
      setSettings(response);
      setMonths(response.default_months || 1);
      setSettingsError(null);
    } catch (error: any) {
      setSettings(null);
      setSettingsError(
        error?.message ?? "Integração com Mercado Pago indisponível.",
      );
    }
  }, [session]);

  const loadPayments = useCallback(
    async (pageIndex: number, pageSize: number) => {
      if (!session) return;
      try {
        setLoadingPayments(true);
        const { items, totalCount } = await listCompanyPayments(
          session,
          pageIndex,
          pageSize,
        );
        setPayments(items);
        setTotalPayments(totalCount);
      } catch (error: any) {
        notifyError(
          error?.message ?? "Não foi possível carregar os pagamentos.",
        );
      } finally {
        setLoadingPayments(false);
      }
    },
    [session],
  );

  useEffect(() => {
    if (!session) return;
    loadSettings();
  }, [session, loadSettings]);

  useEffect(() => {
    if (!session) return;
    loadPayments(pagination.pageIndex, pagination.pageSize);
  }, [session, pagination.pageIndex, pagination.pageSize, loadPayments]);

  const expirationInfo = useMemo(() => {
    if (!company?.subscription_expires_at) {
      return {
        value: "Sem data",
        helper: "Efetue um pagamento para liberar o plano.",
        variant: company?.is_blocked ? "danger" : "default",
      };
    }

    const expiresAt = new Date(company.subscription_expires_at);
    const formatted = expiresAt.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const diffMs = expiresAt.getTime() - Date.now();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const helper =
      diffDays >= 0
        ? `Faltam ${diffDays} dia${diffDays === 1 ? "" : "s"}`
        : "Plano expirado";

    return {
      value: formatted,
      helper,
      variant: diffDays >= 0 ? "default" : "danger",
    };
  }, [company?.subscription_expires_at, company?.is_blocked]);

  const monthlyPrice = settings?.monthly_price ?? 0;
  const totalValue = monthlyPrice * months;

  const statusBadgeClass = company?.is_blocked
    ? "bg-red-100 text-red-700"
    : "bg-green-100 text-green-700";

  const handleMonthsChange = (value: number) => {
    if (!settings) {
      setMonths(value);
      return;
    }
    const min = settings.min_months || 1;
    const max = settings.max_months || 12;
    const clamped = Math.min(max, Math.max(min, value));
    setMonths(clamped);
  };

  const handleCheckout = async () => {
    if (!session || !settings) return;
    setCheckoutLoading(true);
    try {
      const response = await createSubscriptionCheckout(session, months);
      const targetUrl =
        preferSandboxCheckout && response.sandbox_init_point
          ? response.sandbox_init_point
          : response.init_point;

      window.open(targetUrl, "_blank", "noopener,noreferrer");
      notifySuccess(
        "Abrimos o checkout em uma nova aba. Finalize o pagamento por lá.",
      );
    } catch (error: any) {
      notifyError(error?.message ?? "Não foi possível gerar o checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-semibold">CompanyPayment</h1>
            <p className="text-gray-500">
              Gere o checkout via Mercado Pago e acompanhe os pagamentos da sua
              empresa.
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${statusBadgeClass}`}
          >
            {company?.is_blocked ? "Conta bloqueada" : "Conta ativa"}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard
            title="Próximo vencimento"
            value={expirationInfo.value}
            helper={expirationInfo.helper}
            variant={expirationInfo.variant as "default" | "danger"}
          />
          <InfoCard
            title="Valor mensal"
            value={currencyFormatter.format(monthlyPrice)}
            helper={
              settings
                ? "Definido via MP_SUBSCRIPTION_PRICE"
                : (settingsError ?? "Sem configuração")
            }
          />
          <InfoCard
            title="Último pagamento"
            value={
              payments.length > 0 && payments[0].paid_at
                ? new Date(payments[0].paid_at).toLocaleDateString("pt-BR")
                : "Sem registros"
            }
            helper={
              payments.length > 0
                ? `Referência ${payments[0].provider_payment_id}`
                : undefined
            }
            variant={payments.length > 0 ? "success" : "default"}
          />
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Gerar pagamento</h2>
          {settingsError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {settingsError}
            </p>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Meses contratados
            </label>
            <input
              type="number"
              min={settings?.min_months ?? 1}
              max={settings?.max_months ?? 12}
              value={months}
              onChange={(event) =>
                handleMonthsChange(Number(event.target.value))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              disabled={!settings}
            />
            <p className="text-xs text-gray-500">
              Permitido entre {settings?.min_months ?? 1} e{" "}
              {settings?.max_months ?? 12} meses.
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-3xl font-semibold">
              {currencyFormatter.format(totalValue)}
            </p>
            <p className="text-xs text-gray-500">
              O checkout será aberto em uma nova aba do Mercado Pago.
            </p>
          </div>
          <button
            onClick={handleCheckout}
            disabled={!settings || checkoutLoading}
            className="w-full rounded-md bg-indigo-600 text-white font-medium py-3 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
          >
            {checkoutLoading
              ? "Gerando checkout..."
              : "Gerar checkout no Mercado Pago"}
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6 shadow-sm space-y-3">
          <h2 className="text-xl font-semibold">Como funciona</h2>
          <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
            <li>Escolha o número de meses e gere o checkout.</li>
            <li>Finalize o pagamento na aba do Mercado Pago.</li>
            <li>
              Assim que o Mercado Pago confirmar, atualizamos automaticamente o
              vencimento e o histórico.
            </li>
          </ol>
          <p className="text-sm text-gray-500">
            URLs de retorno configuradas nos envs <code>MP_SUCCESS_URL</code>,{" "}
            <code>MP_PENDING_URL</code> e <code>MP_FAILURE_URL</code>.
          </p>
        </div>
      </section>

      <CrudLayout
        title={
          <PageTitle
            title="Pagamentos realizados"
            tooltip="Histórico sincronizado via Mercado Pago"
          />
        }
        refreshButton={
          <Refresh
            onRefresh={() => loadPayments(pagination.pageIndex, pagination.pageSize)}
            isPending={loadingPayments}
          />
        }
        tableChildren={
          <>
            {loadingPayments && (
              <p className="text-sm text-gray-500 mb-2">
                Carregando pagamentos...
              </p>
            )}
            <CrudTable
              columns={CompanyPaymentColumns()}
              data={payments}
              totalCount={totalPayments}
              onPageChange={(pageIndex, pageSize) => {
                setPagination({ pageIndex, pageSize });
              }}
            />
          </>
        }
      />
    </div>
  );
};

export default CompanyPaymentPage;
