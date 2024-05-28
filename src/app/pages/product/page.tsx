'use client'

import CreateProductForm from "@/app/forms/product/create";
import CrudLayout from "@/app/components/crud/layout";
import Menu from "@/app/components/menu/layout";
import ButtonFilter from "@/app/components/crud/button-filter";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudTable from "@/app/components/crud/table";
import ProductColumns from "@/app/entities/product/table-columns";
import GetProducts from "@/app/api/product/route";

// eslint-disable-next-line @next/next/no-async-client-component
const PageProducts = async () => {
    const products = await GetProducts()
    return (
        <Menu>
            <CrudLayout title="Produtos"
                filterButtonChildren={<ButtonFilter name="produto" />}
                plusButtonChildren={<ButtonPlus name="produto" href="/product/new"><CreateProductForm /></ButtonPlus>}
                tableChildren={<CrudTable columns={ProductColumns()} data={products}></CrudTable>} />
        </Menu>
    );
}

export default PageProducts