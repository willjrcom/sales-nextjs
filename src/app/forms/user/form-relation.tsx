import React, { useState } from 'react';
import User from '@/app/entities/user/user';
import { useSession } from 'next-auth/react';
import ButtonsModal from '../../components/modal/buttons-modal';
import CreateFormsProps from '../create-forms-props';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import AddUserToCompany from '@/app/api/company/add/company';
import RemoveUserFromCompany from '@/app/api/company/remove/company';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { TextField } from '@/app/components/modal/field';
import { useQueryClient } from '@tanstack/react-query';

const UserFormRelation = ({ item, isUpdate }: CreateFormsProps<User>) => {
    const modalName = isUpdate ? 'edit-user-' + item?.id : 'edit-user'
    const modalHandler = useModal();
    const [user, setUser] = useState<User>(item || new User());
    const queryClient = useQueryClient();
    const { data } = useSession();

    const handleAddUserToCompany = async () => {
        if (!data) return;

        try {
            await AddUserToCompany(user.email, data)
            queryClient.invalidateQueries({ queryKey: ['users'] });
            notifySuccess(`Usuário ${user.name} adicionado com sucesso`);
            modalHandler.hideModal(modalName);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || `Erro ao adicionar usuário ${user.name}`);
        }
    }

    const handleRemoveUserFromCompany = async () => {
        if (!data) return;

        try {
            await RemoveUserFromCompany(user.email, data)
            queryClient.invalidateQueries({ queryKey: ['users'] });
            notifySuccess(`Usuário ${user.name} removido com sucesso`);
            modalHandler.hideModal(modalName);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || `Erro ao remover usuário ${user.name}`);
        }
    }

    if (isUpdate && user) {
        return (
            <>
                <p className='text-gray-600'><strong>Email:</strong> {user.email}</p>
                <p className='text-gray-600'><strong>Nome:</strong> {user.name}</p>
                {user.contact && <p className='text-gray-600'><strong>Telefone:</strong> {user.contact.number}</p>}
                <p className='text-gray-600'><strong>CPF:</strong> {user.cpf}</p>
                <ButtonsModal item={user} name="Usuário" deleteItem={handleRemoveUserFromCompany} isRemoveItem />
            </>
        );
    };

    return (
        <>
            <TextField name="email" friendlyName="Email" placeholder="Digite o e-mail" setValue={value => setUser(prev => ({ ...prev, email: value }))} value={user.email} />
            <ButtonsModal item={user} name="Usuário" onSubmit={handleAddUserToCompany} />
        </>
    );
};

export default UserFormRelation;