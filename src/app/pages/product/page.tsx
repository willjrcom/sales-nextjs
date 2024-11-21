'use client';

import ProductForm from "@/app/forms/product/form";
import CrudLayout from "@/app/components/crud/layout";
import Menu from "@/app/components/menu/layout";
import ButtonFilter from "@/app/components/crud/button-filter";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudTable from "@/app/components/crud/table";
import ProductColumns from "@/app/entities/product/table-columns";
import Refresh from "@/app/components/crud/refresh";
import ModalHandler from "@/app/components/modal/modal";
import NewProduct from "@/app/api/product/new/route";
import { ProductProvider, useProducts } from "@/app/context/product/context";

const PageProducts = () => {
    return (
        <Menu>
            <ProductProvider>
                <Crud />
            </ProductProvider>
        </Menu>
    );
}

const Crud = () => {
    const modalHandler = ModalHandler();
    const context = useProducts();

    if (context.getLoading()) {
        return (
            <h1>Carregando página...</h1>
        )
    }

    return (
        <>
        {context.getError() && <p className="mb-4 text-red-500">{context.getError()}</p>}
            <CrudLayout title="Produtos"
                filterButtonChildren={
                    <ButtonFilter name="produto" 
                    setShowModal={modalHandler.setShowModal} 
                    showModal={modalHandler.showModal}/>
                }
                plusButtonChildren={
                    <ButtonPlus name="produto"
                        setModal={modalHandler.setShowModal}
                        showModal={modalHandler.showModal}>
                        <ProductForm 
                            onSubmit={NewProduct}
                            handleCloseModal={() => modalHandler.setShowModal(false)}
                            context={context}/>
                    </ButtonPlus>
                }
                refreshButton={
                    <Refresh 
                        context={context}
                    />
                }
                tableChildren={
                    <CrudTable 
                        columns={ProductColumns()} 
                        data={context.items}>
                    </CrudTable>
                } 
                />
            </>
    )
}
export default PageProducts;
