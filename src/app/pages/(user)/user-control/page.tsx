'use client';

import UserForm from "@/app/forms/user/form-profile";
import CrudLayout from "@/app/components/crud/layout";
import CrudTable from "@/app/components/crud/table";
import UserColumns from "@/app/entities/user/table-columns";
import Refresh from "@/app/components/crud/refresh";
import { FaFilter } from "react-icons/fa";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { TextField } from "@/app/components/modal/field";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import GetCompany from "@/app/api/company/route";
import { useSession } from "next-auth/react";
import User from "@/app/entities/user/user";
import Company from "@/app/entities/company/company";
import { fetchUsers } from "@/redux/slices/users";
import UserFormRelation from "@/app/forms/user/form-relation";

const PageUser = () => {
    const [nome, setNome] = useState<string>("");
    const [company, setCompany] = useState<Company>(new Company());
    const usersSlice = useSelector((state: RootState) => state.users);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();
    

    useEffect(() => {
        if (data && Object.keys(usersSlice.entities).length === 0) {
            dispatch(fetchUsers(data));
        }
    
        const interval = setInterval(() => {
            if (data) {
                dispatch(fetchUsers(data));
            }
        }, 60000); // Atualiza a cada 60 segundos
    
        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data?.user.idToken, dispatch]);

    if (!company) {
        return (
            <h1>Carregando página...</h1>
        )
    }
    
    const filteredUsers = Object.values(usersSlice.entities).filter(user => user.name.includes(nome)).sort((a, b) => a.name.localeCompare(b.name));
    
    return (
        <>
            <CrudLayout
                title="Usuários"
                searchButtonChildren={
                    <TextField friendlyName="Nome" name="nome" placeholder="Digite o nome do usuário" setValue={setNome} value={nome} optional />
                }
                filterButtonChildren={
                    <ButtonIconTextFloat modalName="filter-user" icon={FaFilter}>
                        <h1>Filtro</h1>
                    </ButtonIconTextFloat>
                }
                plusButtonChildren={
                    <ButtonIconTextFloat modalName="edit-user" position="bottom-right" size="xl"
                        title="Novo usuário">
                        <UserFormRelation />
                    </ButtonIconTextFloat>
                }
                refreshButton={
                    <Refresh
                        slice={usersSlice}
                        fetchItems={fetchUsers}
                    />
                }
                tableChildren={
                    <CrudTable 
                        columns={UserColumns()} 
                        data={filteredUsers} />
                }
            />
        </>
    )
}
export default PageUser;
