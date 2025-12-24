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
import GetCategories from "@/app/api/category/category";
import { notifyError } from "@/app/utils/notifications";

const PageStock = () => {
    const [productID, setProductID] = useState("");
    const [stockFilter, setStockFilter] = useState("all"); // all, low, out
    const [lastUpdate, setLastUpdate] = useState(FormatRefreshTime(new Date()));
    const { data } = useSession();

    const { isPending: categoriesPending, error: categoriesError, data: categoriesResponse } = useQuery({
        queryKey: ['categories'],
        queryFn: () => GetCategories(data!),
        enabled: !!data?.user?.access_token,
    });

    const { isPending: stockPending, error: stockError, data: report, refetch } = useQuery({
        queryKey: ['stock-report'],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetStockReport(data!);
        },
        enabled: !!data?.user?.access_token,
    });

    useEffect(() => {
        if (categoriesError) notifyError('Erro ao carregar categorias');
    }, [categoriesError]);

    useEffect(() => {
        if (stockError) notifyError('Erro ao carregar relatório de estoque');
    }, [stockError]);

    // Filtrar estoques baseado nos filtros
    let filteredStocks: Stock[] = [];

    if (report?.all_stocks) {
        // Garantir que all_stocks seja um array
        filteredStocks = Array.isArray(report.all_stocks) ? report.all_stocks : [];
    }

    // Filtrar por produto se selecionado
    if (productID && Array.isArray(filteredStocks)) {
        filteredStocks = filteredStocks.filter(stock => stock.product_id === productID);
    }

    // Aplicar filtros de status
    if (Array.isArray(filteredStocks)) {
        if (stockFilter === "low") {
            filteredStocks = filteredStocks.filter(stock =>
                new Decimal(stock?.current_stock || 0).lessThanOrEqualTo(stock.min_stock) &&
                new Decimal(stock?.current_stock || 0).greaterThan(0)
            );
        } else if (stockFilter === "out") {
            filteredStocks = filteredStocks.filter(stock =>
                new Decimal(stock?.current_stock || 0).lessThanOrEqualTo(0)
            );
        }

        // Ordenar por nome do produto
        filteredStocks = filteredStocks.sort((a, b) =>
            (a.product?.name || '').localeCompare(b.product?.name || '')
        );
    }

    // Garantir que sempre seja um array
    if (!Array.isArray(filteredStocks)) {
        filteredStocks = [];
    }

    // Preparar produtos para o filtro
    const products = useMemo(() => (categoriesResponse?.items || []), [categoriesResponse?.items]);
    const filteredProducts = useMemo(() => products
        .map((category) => {
            if (!category.products || !Array.isArray(category.products)) return [];
            return category.products
                .filter(product => product && product.size) // Garantir que product e size existam
                .map(product => ({
                    id: product.id,
                    name: `${product.name} - ${product.size?.name || ''}`
                }));
        })
        .flat()
        .filter(p => p.id && p.name), [products]);
    
    return (
        <>

            <div className="flex gap-2">
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
                    <SelectField
                        friendlyName="Produto"
                        name="produto"
                        selectedValue={productID}
                        setSelectedValue={setProductID}
                        values={filteredProducts}
                        optional
                    />
                }
                refreshButton={
                    <Refresh
                        onRefresh={refetch}
                        isPending={stockPending && categoriesPending}
                        lastUpdate={lastUpdate}
                    />
                }
                tableChildren={
                    <CrudTable
                        columns={StockColumns()}
                        data={filteredStocks || []}>
                    </CrudTable>
                }
            />
        </>
    )
}

export default PageStock;
