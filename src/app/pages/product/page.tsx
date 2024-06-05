'use client';

import ProductForm from "@/app/forms/product/form";
import CrudLayout from "@/app/components/crud/layout";
import Menu from "@/app/components/menu/layout";
import ButtonFilter from "@/app/components/crud/button-filter";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudTable from "@/app/components/crud/table";
import ProductColumns from "@/app/entities/product/table-columns";
import GetProducts from "@/app/api/product/route";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Product from "@/app/entities/product/product";
import { useSession } from "next-auth/react";
import ModalHandler from "@/app/components/modal/modal";
import NewProduct from "@/app/api/product/new/route";
import FetchData from "@/app/api/fetch-data";

const PageProducts = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState(formattedTime);
    const { data, status } = useSession();
    const modalHandler = ModalHandler();

    const fetchData = async () => {
        if (!data) return;
        FetchData({ getItems: GetProducts, setItems: setProducts, data, setError, setLoading }  )
    }

    useEffect(() => {
        if (status === "authenticated") {
            fetchData();
        }
    }, [data, status]);

    return (
        <Menu>
            <CrudLayout title="Produtos"
                filterButtonChildren={
                    <ButtonFilter name="produto" />
                }
                plusButtonChildren={
                    <ButtonPlus name="produto"
                        setModal={modalHandler.setShowModal}
                        showModal={modalHandler.showModal}>
                        <ProductForm 
                            onSubmit={NewProduct}
                            handleCloseModal={() => modalHandler.setShowModal(false)}
                            reloadData={fetchData}/>
                    </ButtonPlus>
                }
                refreshButton={
                    <Refresh 
                        lastUpdate={lastUpdate} 
                        setItems={setProducts} 
                        getItems={GetProducts} 
                        setLastUpdate={setLastUpdate} 
                    />
                }
                tableChildren={
                    <CrudTable 
                        columns={ProductColumns()} 
                        data={products}>
                    </CrudTable>
                } 
                />
        </Menu>
    );
}

export default PageProducts;
