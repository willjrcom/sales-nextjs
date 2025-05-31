'use client';

import CrudLayout from "@/app/components/crud/layout";
import PageTitle from '@/app/components/PageTitle';
import ClientForm from "@/app/forms/client/form";
import CrudTable from "@/app/components/crud/table";
import ClientColumns from "@/app/entities/client/table-columns";
import Refresh from "@/app/components/crud/refresh";
import { TextField } from "@/app/components/modal/field";
import { useEffect, useState } from "react";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { FaFilter } from "react-icons/fa";
import { fetchClients } from "@/redux/slices/clients";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useSession } from "next-auth/react";

const PageClient = () => {
    const [nome, setNome] = useState<string>("");
    const clientsSlice = useSelector((state: RootState) => state.clients);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        if (data && Object.keys(clientsSlice.entities).length === 0) {
            dispatch(fetchClients({ session: data, page: pageIndex, perPage: pageSize }));
        }
    }, [data?.user.access_token, dispatch]);

    return (
        <>
            <CrudLayout title={<PageTitle title="Clientes" tooltip="Gerencie o cadastro de clientes, incluindo busca e filtro por nome." />}
                searchButtonChildren={
                    <TextField friendlyName="Nome" name="nome" placeholder="Digite o nome do cliente" setValue={setNome} value={nome} optional />
                }
                filterButtonChildren={
                    <ButtonIconTextFloat modalName="filter-client" icon={FaFilter}><h1>Filtro</h1></ButtonIconTextFloat>
                }

                plusButtonChildren={
                    <ButtonIconTextFloat title="Novo cliente" modalName="new-client" position="bottom-right">
                        <ClientForm />
                    </ButtonIconTextFloat>
                }
                refreshButton={
                    <Refresh
                        fetchItems={fetchClients}
                        slice={clientsSlice}
                        page={pageIndex}
                        perPage={pageSize}
                    />
                }
                tableChildren={
                    <CrudTable
                        columns={ClientColumns()}
                        data={Object.values(clientsSlice.entities).sort((a, b) => a.name.localeCompare(b.name))}
                        totalCount={clientsSlice.totalCount}
                        onPageChange={(pageIndex, pageSize) => {
                            setPageIndex(pageIndex);
                            setPageSize(pageSize);
                        }}>
                    </CrudTable>
                }
            />
        </>
    )
}
export default PageClient