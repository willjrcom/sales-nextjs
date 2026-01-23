'use client';

import StockForm from "@/app/forms/stock/form";
import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/PageTitle';
import CrudTable from "@/app/components/crud/table";
import StockColumns from "@/app/entities/stock/table-columns";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { FaChartBar, FaExclamationTriangle } from "react-icons/fa";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { SelectField } from "@/app/components/modal/field";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import StockReport from "@/app/components/stock/stock-report";
import StockAlerts from "@/app/components/stock/stock-alerts";
import Stock from "@/app/entities/stock/stock";
import { StockReportComplete } from "@/app/entities/stock/stock-report";
import Decimal from "decimal.js";
import { useQuery } from "@tanstack/react-query";
import { GetAllStocks, GetStockReport } from "@/app/api/stock/stock";
import { notifyError } from "@/app/utils/notifications";
import GetProducts from "@/app/api/product/product";

const PageStock = () => {
    const [stockFilter, setStockFilter] = useState("all"); // all, low, out
    const [lastUpdate, setLastUpdate] = useState(FormatRefreshTime(new Date()));
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const { data } = useSession();

    const { isPending: stockPending, error: stockError, data: stocksResponse, refetch } = useQuery({
        queryKey: ['stocks', pagination.pageIndex, pagination.pageSize],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetAllStocks(data!, pagination.pageIndex, pagination.pageSize);
        },
        enabled: !!data?.user?.access_token,
    });

    useEffect(() => {
        if (stockError) notifyError('Erro ao carregar relatório de estoque');
    }, [stockError]);

    const stocks = useMemo(() => stocksResponse?.items || [], [stocksResponse?.items]);

    const filteredStocks = useMemo(() => {
        let filteredStocks = stocks;

        // filtro de status
        if (stockFilter === "low") {
            filteredStocks = filteredStocks.filter(s => {
                const current = new Decimal(s?.current_stock || 0);
                return current.lessThanOrEqualTo(s.min_stock) && current.greaterThan(0);
            });
        }

        if (stockFilter === "out") {
            filteredStocks = filteredStocks.filter(s => new Decimal(s?.current_stock || 0).lessThanOrEqualTo(0));
        }

        // IMPORTANTÍSSIMO:
        // sort muta o array, então clona antes
        return [...filteredStocks].sort((a, b) => (a.product?.name || '').localeCompare(b.product?.name || ''));
    }, [stocks, stockFilter]);

    const totalCount = useMemo(() => parseInt(stocksResponse?.headers.get('X-Total-Count') || '0'), [stocksResponse?.items]);

    return (
        <>
            <div className="flex gap-2">
                <ButtonIconTextFloat modalName="stock-report" icon={FaChartBar} position="bottom-left-1">
                    <StockReport />
                </ButtonIconTextFloat>

                <ButtonIconTextFloat modalName="stock-alerts" icon={FaExclamationTriangle} position="bottom-left">
                    <StockAlerts />
                </ButtonIconTextFloat>
            </div>

            <ButtonIconTextFloat modalName="new-stock" title="Novo Controle de estoque" position="bottom-right">
                <StockForm />
            </ButtonIconTextFloat>

            <CrudLayout
                title={
                    <PageTitle
                        title="Controle de Estoque"
                        tooltip="Gerencie o estoque de produtos, visualize alertas e movimentações."
                    />
                }
                searchButtonChildren={
                    <>
                        <SelectField
                            friendlyName="Status"
                            name="status"
                            removeDefaultOption
                            selectedValue={stockFilter}
                            setSelectedValue={setStockFilter}
                            values={[
                                { id: "all", name: "Mostrar Todos" },
                                { id: "low", name: "Estoque Baixo" },
                                { id: "out", name: "Sem Estoque" }
                            ]}
                        />
                    </>
                }
                refreshButton={
                    <Refresh
                        onRefresh={refetch}
                        isPending={stockPending}
                        lastUpdate={lastUpdate}
                    />
                }
                tableChildren={
                    <CrudTable
                        columns={StockColumns()}
                        data={filteredStocks || []}
                        totalCount={totalCount}
                        onPageChange={(pageIndex, pageSize) => {
                            setPagination({ pageIndex, pageSize });
                        }}
                    >
                    </CrudTable>
                }
            />
        </>
    )
}

export default PageStock;
