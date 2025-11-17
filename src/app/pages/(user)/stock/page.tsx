'use client';

import StockForm from "@/app/forms/stock/form";
import CrudLayout from "@/app/components/crud/layout";
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
    const reportStockSlice = useSelector((state: RootState) => state.reportStocks);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    useEffect(() => {
        if (data && Object.keys(categoriesSlice.entities).length === 0) {
            dispatch(fetchCategories({ session: data }));
        }
    }, [data?.user.access_token, dispatch]);

    // Carregar dados de estoque
    useEffect(() => {
        if (data) {
            dispatch(fetchReportStocks({ session: data }));
        }
    }, [data?.user.access_token, dispatch]);

    if (reportStockSlice.loading) {
        return (
            <h1>Carregando página...</h1>
        )
    }

    // Filtrar estoques baseado nos filtros
    let reports = Object.values(reportStockSlice.entities);
    let report: StockReportComplete = {} as StockReportComplete;
    let filteredStocks: Stock[] = [];

    if (reports?.length > 0) {
        report = reports[0]
        filteredStocks = report.all_stocks;
    }
    if (productID) {
        filteredStocks = report?.all_stocks?.filter(stock => stock.product_id === productID);
    }

    if (stockFilter === "low") {
        filteredStocks = [...filteredStocks].filter(stock =>
            new Decimal(stock?.current_stock || 0).lessThanOrEqualTo(stock.min_stock) &&
            new Decimal(stock?.current_stock || 0).greaterThan(0)
        );
    } else if (stockFilter === "out") {
        filteredStocks = [...filteredStocks].filter(stock =>
            new Decimal(stock?.current_stock || 0).lessThanOrEqualTo(0)
        );
    }

    // Ordenar por nome do produto
    filteredStocks = [...filteredStocks].sort((a, b) =>
        (a.product?.name || '').localeCompare(b.product?.name || '')
    );

    // Preparar produtos para o filtro
    const products = Object.values(categoriesSlice.entities)
        .map((category) => {
            return category.products?.map(product => ({
                id: product.id,
                name: product.name
            })) || []
        }).flat();

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
                
                {report?.summary?.total_active_alerts && report?.summary?.total_active_alerts > 0 && (
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
                        slice={reportStockSlice}
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
