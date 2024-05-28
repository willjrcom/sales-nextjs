'use client';

import CreateProductForm from "@/app/forms/product/create";
import CrudLayout from "@/app/components/crud/layout";
import Menu from "@/app/components/menu/layout";
import ButtonFilter from "@/app/components/crud/button-filter";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudTable from "@/app/components/crud/table";
import ProductColumns from "@/app/entities/product/table-columns";
import GetProducts from "@/app/api/product/route";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { useEffect, useState } from "react";
import { Product } from "@/app/entities/product/product";

const PageProducts = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState(formattedTime);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const products = await GetProducts()
                setProducts(products);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <Menu>
            <CrudLayout title="Produtos"
                filterButtonChildren={<ButtonFilter name="produto" />}
                plusButtonChildren={
                    <ButtonPlus name="produto" href="/product/new">
                        <CreateProductForm />
                    </ButtonPlus>
                    }
                refreshButton={<Refresh lastUpdate={lastUpdate} setItems={setProducts} getItems={GetProducts} setLastUpdate={setLastUpdate} />}
                tableChildren={<CrudTable columns={ProductColumns()} data={products}></CrudTable>} />
        </Menu>
    );
}

export default PageProducts;
