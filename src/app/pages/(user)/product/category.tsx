'use client';

import CategoryForm from "@/app/forms/category/form";
import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/PageTitle';
import CrudTable from "@/app/components/crud/table";
import CategoryColumns from "@/app/entities/category/table-columns";
import Refresh from "@/app/components/crud/refresh";
import { FaFilter } from "react-icons/fa";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchCategories } from "@/redux/slices/categories";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import "./style.css";

const PageCategories = () => {
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    useEffect(() => {
        const token = data?.user?.access_token;
        const hasCategories = categoriesSlice.ids.length > 0;

        if (token && !hasCategories) {
            dispatch(fetchCategories({ session: data }));
        }
    }, [data?.user?.access_token, categoriesSlice.ids.length]);

    if (categoriesSlice.loading) {
        return (
            <h1>Carregando página...</h1>
        )
    }

    return (
        <>
            <ButtonIconTextFloat modalName="filter-category" icon={FaFilter}><h1>Filtro</h1></ButtonIconTextFloat>

            <ButtonIconTextFloat title="Nova categoria" modalName="new-category" position="bottom-right">
                <CategoryForm />
            </ButtonIconTextFloat>

            <CrudLayout title={<PageTitle title="Categorias" tooltip="Gerencie categorias de produtos, permitindo adicionar, editar ou remover." />}
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