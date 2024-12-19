'use client';

import CrudLayout from "@/app/components/crud/layout";
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

    useEffect(() => {
        if (data && Object.keys(clientsSlice.entities).length === 0) {
            dispatch(fetchClients(data));
        }
    
        const interval = setInterval(() => {
            if (data) {
                dispatch(fetchClients(data));
            }
        }, 60000); // Atualiza a cada 60 segundos
    
        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data?.user.idToken, dispatch]);

    return (
        <>
            {clientsSlice.error && <p className="mb-4 text-red-500">{clientsSlice.error?.message}</p>}
            <CrudLayout title="Clientes"
                searchButtonChildren={
                    <TextField friendlyName="Nome" name="nome" placeholder="Digite o nome do cliente" setValue={setNome} value={nome} />
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
                    />
                }
                tableChildren={
                    <CrudTable
                        columns={ClientColumns()}
                        data={Object.values(clientsSlice.entities).sort((a, b) => a.name.localeCompare(b.name))}>
                    </CrudTable>
                }
            />
        </>
    )
}
export default PageClient