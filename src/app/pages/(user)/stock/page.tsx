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
import { fetchStocks, fetchLowStocks, fetchOutOfStocks, fetchReportStocks } from "@/redux/slices/stock";
import AddStockForm from "@/app/forms/stock/add-stock";
import RemoveStockForm from "@/app/forms/stock/remove-stock";
import StockReport from "@/app/components/stock/stock-report";
import StockAlerts from "@/app/components/stock/stock-alerts";

const PageStock = () => {
    const [productID, setProductID] = useState("");
    const [stockFilter, setStockFilter] = useState("all"); // all, low, out
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const stockSlice = useSelector((state: RootState) => state.stocks);
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
            dispatch(fetchStocks({ session: data }));
            dispatch(fetchLowStocks({ session: data }));
            dispatch(fetchOutOfStocks({ session: data }));
            dispatch(fetchReportStocks({ session: data }));
        }
    }, [data?.user.access_token, dispatch]);

    useEffect(() => {
    }, [reportStockSlice]);


    if (stockSlice.loading) {
        return (
            <h1>Carregando página...</h1>
        )
    }

    // Filtrar estoques baseado nos filtros
    let filteredStocks = Object.values(stockSlice.entities);
    
    if (productID) {
        filteredStocks = filteredStocks.filter(stock => stock.product_id === productID);
    }
    
    if (stockFilter === "low") {
        filteredStocks = filteredStocks.filter(stock => 
            stock.current_stock.lessThanOrEqualTo(stock.min_stock) && 
            stock.current_stock.greaterThan(0)
        );
    } else if (stockFilter === "out") {
        filteredStocks = filteredStocks.filter(stock => 
            stock.current_stock.lessThanOrEqualTo(0)
        );
    }

    // Ordenar por nome do produto
    filteredStocks = filteredStocks.sort((a, b) => 
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
                filterButtonChildren={
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
                        <ButtonIconTextFloat modalName="stock-report" icon={FaChartBar}>
                            <h1>Relatório</h1>
                        </ButtonIconTextFloat>
                        {reportStockSlice?.entities.summary.summary.total_active_alerts && reportStockSlice.entities.summary.summary.total_active_alerts > 0 && (
                            <ButtonIconTextFloat modalName="stock-alerts" icon={FaExclamationTriangle}>
                                <h1>Alertas ({reportStockSlice.entities.summary.summary.total_active_alerts})</h1>
                            </ButtonIconTextFloat>
                        )}
                    </div>
                }
                plusButtonChildren={
                    <div className="flex gap-2">
                        <ButtonIconTextFloat modalName="add-stock" title="Adicionar Estoque" position="bottom-right">
                            <AddStockForm />
                        </ButtonIconTextFloat>
                        <ButtonIconTextFloat modalName="remove-stock" title="Remover Estoque" position="bottom-right-1">
                            <RemoveStockForm />
                        </ButtonIconTextFloat>
                        <ButtonIconTextFloat modalName="new-stock" title="Novo Controle" position="bottom-right-2">
                            <StockForm />
                        </ButtonIconTextFloat>
                    </div>
                }
                refreshButton={
                    <Refresh
                        slice={categoriesSlice}
                        fetchItems={fetchCategories}
                    />
                }
                tableChildren={
                    <CrudTable
                        columns={StockColumns()}
                        data={filteredStocks}>
                    </CrudTable>
                }
            />

            {/* Modal de Relatório */}
            <div id="stock-report" className="modal">
                <div className="modal-content max-w-4xl">
                    <StockReport reportStock={reportStockSlice.entities} />
                </div>
            </div>

            {/* Modal de Alertas */}
            <div id="stock-alerts" className="modal">
                <div className="modal-content max-w-4xl">
                    <StockAlerts />
                </div>
            </div>
        </>
    )
}

export default PageStock;
