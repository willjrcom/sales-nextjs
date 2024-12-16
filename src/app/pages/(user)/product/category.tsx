'use client';

import CategoryForm from "@/app/forms/category/form";
import CrudLayout from "@/app/components/crud/layout";
import CrudTable from "@/app/components/crud/table";
import CategoryColumns from "@/app/entities/category/table-columns";
import Refresh from "@/app/components/crud/refresh";
import { FaFilter } from "react-icons/fa";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import "./style.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchCategories } from "@/redux/slices/categories";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const PageCategories = () => {
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();
    
    useEffect(() => {
        if (data && Object.keys(categoriesSlice.entities).length === 0) {
            dispatch(fetchCategories(data));
        }
    
        const interval = setInterval(() => {
            if (data && !categoriesSlice) {
                dispatch(fetchCategories(data));
            }
        }, 60000); // Atualiza a cada 60 segundos
    
        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data, categoriesSlice, dispatch]);

    if (categoriesSlice.loading) {
        return (
            <h1>Carregando página...</h1>
        )
    }

    return (
        <>
            {categoriesSlice.error && <p className="mb-4 text-red-500">{categoriesSlice.error?.message}</p>}
            <CrudLayout title="Categorias"
                filterButtonChildren={
                    <ButtonIconTextFloat modalName="filter-category" icon={FaFilter}><h1>Filtro</h1></ButtonIconTextFloat>
                }
                plusButtonChildren={
                    <ButtonIconTextFloat title="Nova categoria" modalName="new-category" position="bottom-right">
                        <CategoryForm />
                    </ButtonIconTextFloat>
                }
                refreshButton={
                    <Refresh
                        slice={categoriesSlice}
                        fetchItems={fetchCategories}
                    />
                }
                tableChildren={
                    <CrudTable
                        columns={CategoryColumns()}
                        data={Object.values(categoriesSlice.entities).sort((a, b) => a.name.localeCompare(b.name))}>
                    </CrudTable>
                }
            />
        </>
    )
}
export default PageCategories;