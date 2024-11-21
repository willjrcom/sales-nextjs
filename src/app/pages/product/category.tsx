'use client';

import CategoryForm from "@/app/forms/category/form";
import CrudLayout from "@/app/components/crud/layout";
import ButtonFilter from "@/app/components/crud/button-filter";
import ButtonPlus from "@/app/components/crud/button-plus";
import CrudTable from "@/app/components/crud/table";
import CategoryColumns from "@/app/entities/category/table-columns";
import Refresh from "@/app/components/crud/refresh";
import ModalHandler from "@/app/components/modal/modal";
import NewCategory from "@/app/api/category/new/route";
import { useCategories } from "@/app/context/category/context";
import "./style.css";

const PageCategories = () => {
    const modalHandler = ModalHandler();
    const context = useCategories();

    if (context.getLoading()) {
        return (
            <h1>Carregando página...</h1>
        )
    }

    return (
        <>
        {context.getError() && <p className="mb-4 text-red-500">{context.getError()}</p>}
            <CrudLayout title="Categorias"
                filterButtonChildren={
                    <ButtonFilter name="categoria" 
                    setShowModal={modalHandler.setShowModal} 
                    showModal={modalHandler.showModal}/>
                }
                plusButtonChildren={
                    <ButtonPlus name="categoria"
                        setModal={modalHandler.setShowModal}
                        showModal={modalHandler.showModal}>
                        <CategoryForm 
                            onSubmit={NewCategory}
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
                        columns={CategoryColumns()} 
                        data={context.items}>
                    </CrudTable>
                } 
                />
            </>
    )
}
export default PageCategories;