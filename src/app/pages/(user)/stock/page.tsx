'use client';

import StockForm from "@/app/forms/stock/form";
import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/PageTitle';
import CrudTable from "@/app/components/crud/table";
import StockColumns from "@/app/entities/stock/table-columns";
import Refresh from "@/app/components/crud/refresh";
import { FaChartBar, FaExclamationTriangle } from "react-icons/fa";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { SelectField } from "@/app/components/modal/field";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useSession } from "next-auth/react";
import { fetchCategories } from "@/redux/slices/categories";
import { fetchReportStocks } from "@/redux/slices/stock";
import StockReport from "@/app/components/stock/stock-report";
import StockAlerts from "@/app/components/stock/stock-alerts";
import Stock from "@/app/entities/stock/stock";
import { StockReportComplete } from "@/app/entities/stock/stock-report";
import Decimal from "decimal.js";

const PageStock = () => {
    const [productID, setProductID] = useState("");
    const [stockFilter, setStockFilter] = useState("all"); // all, low, out
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const reportStocksSlice = useSelector((state: RootState) => state.reportStocks);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    useEffect(() => {
        const token = data?.user?.access_token;
        const hasCategoriesSlice = categoriesSlice.ids.length > 0;

        if (token && !hasCategoriesSlice) {
            dispatch(fetchCategories({ session: data }));
        }
    }, [data?.user.access_token, categoriesSlice.ids.length]);

    // Carregar dados de estoque
    useEffect(() => {
        const token = data?.user?.access_token;
        const hasReportStocksSlice = reportStocksSlice.ids.length > 0;

        if (token && !hasReportStocksSlice) {
            dispatch(fetchReportStocks({ session: data }));
        }
    }, [data?.user.access_token, reportStocksSlice.ids.length]);

    // Filtrar estoques baseado nos filtros
    let reports = Object.values(reportStocksSlice.entities);
    let report: StockReportComplete = {} as StockReportComplete;
    let filteredStocks: Stock[] = [];

    if (reports?.length > 0) {
        report = reports[0];
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
    const products = Object.values(categoriesSlice.entities)
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
        .filter(p => p.id && p.name); // Remover entradas inválidas

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
                    <StockReport reportStock={report} />
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
                        values={products}
                        optional
                    />
                }
                refreshButton={
                    <Refresh
                        slice={reportStocksSlice}
                        fetchItems={fetchReportStocks}
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
