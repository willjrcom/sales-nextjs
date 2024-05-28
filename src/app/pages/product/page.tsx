'use client'

import CreateProductForm from "@/app/forms/product/create";
import CrudLayout from "@/app/components/crud/layout";
import Menu from "@/app/components/menu/layout";
import ButtonFilter from "@/app/components/crud/button-filter";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudTable from "@/app/components/crud/table";

const PageProducts = () => {
    return (
        <Menu>
            <CrudLayout title="Produtos"
                filterButtonChildren={<ButtonFilter name="produto" />}
                plusButtonChildren={<ButtonPlus name="produto" href="/product/new"><CreateProductForm /></ButtonPlus>}
                tableChildren={<CrudTable></CrudTable>} />
        </Menu>
    );
}

export default PageProducts