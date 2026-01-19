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
import { GetStockReport } from "@/app/api/stock/stock";
import { notifyError } from "@/app/utils/notifications";
import GetProducts from "@/app/api/product/product";

const PageStock = () => {
    const [productID, setProductID] = useState("");
    const [stockFilter, setStockFilter] = useState("all"); // all, low, out
    const [lastUpdate, setLastUpdate] = useState(FormatRefreshTime(new Date()));
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const { data } = useSession();

    const { isPending: productsPending, error: productsError, data: productsResponse } = useQuery({
        queryKey: ['products', true],
        queryFn: () => GetProducts(data!, 0, 1000, true),
        enabled: !!data?.user?.access_token,
    });

    const { isPending: stockPending, error: stockError, data: report, refetch } = useQuery({
        queryKey: ['stocks', pagination.pageIndex, pagination.pageSize],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetStockReport(data!);
        },
        enabled: !!data?.user?.access_token,
    });

    useEffect(() => {
        if (productsError) notifyError('Erro ao carregar produtos');
    }, [productsError]);

    useEffect(() => {
        if (stockError) notifyError('Erro ao carregar relatório de estoque');
    }, [stockError]);

    const filteredStocks = useMemo<Stock[]>(() => {
        if (!report?.all_stocks || !Array.isArray(report.all_stocks)) return [];

        let stocks = report.all_stocks;

        // filtrar por produto
        if (productID) {
            stocks = stocks.filter(s => s.product_id === productID);
        }

        // filtro de status
        if (stockFilter === "low") {
            stocks = stocks.filter(s => {
                const current = new Decimal(s?.current_stock || 0);
                return current.lessThanOrEqualTo(s.min_stock) && current.greaterThan(0);
            });
        }

        if (stockFilter === "out") {
            stocks = stocks.filter(s => new Decimal(s?.current_stock || 0).lessThanOrEqualTo(0));
        }

        // IMPORTANTÍSSIMO:
        // sort muta o array, então clona antes
        return [...stocks].sort((a, b) =>
            (a.product?.name || '').localeCompare(b.product?.name || '')
        );
    }, [report?.all_stocks, productID, stockFilter]);


    // Preparar produtos para o filtro
    const products = useMemo(() => (productsResponse?.items || []), [productsResponse?.items]);

    return (
        <>

            <div className="flex gap-2">
                <ButtonIconTextFloat modalName="stock-report" icon={FaChartBar} position="bottom-left-1">
                    <StockReport reportStock={report || {} as StockReportComplete} />
                </ButtonIconTextFloat>

                {report?.summary && typeof report.summary.total_active_alerts === 'number' && report.summary.total_active_alerts > 0 && (
                    <ButtonIconTextFloat modalName="stock-alerts" icon={FaExclamationTriangle} position="bottom-left">
                        <StockAlerts />
                    </ButtonIconTextFloat>
                )}
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
                            friendlyName="Produto"
                            name="produto"
                            selectedValue={productID}
                            setSelectedValue={setProductID}
                            values={products}
                            optional
                        />

                        <SelectField
                            friendlyName="Status"
                            name="status"
                            selectedValue={stockFilter}
                            setSelectedValue={setStockFilter}
                            values={[
                                { id: "all", name: "Todos" },
                                { id: "low", name: "Estoque Baixo" },
                                { id: "out", name: "Sem Estoque" }
                            ]}
                        />
                    </>
                }
                refreshButton={
                    <Refresh
                        onRefresh={refetch}
                        isPending={stockPending && productsPending}
                        lastUpdate={lastUpdate}
                    />
                }
                tableChildren={
                    <CrudTable
                        columns={StockColumns()}
                        data={filteredStocks || []}
                        totalCount={filteredStocks.length}
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
