import React, { useState } from 'react';
import User from '@/app/entities/user/user';
import { useSession } from 'next-auth/react';
import ButtonsModal from '../../components/modal/buttons-modal';
import CreateFormsProps from '../create-forms-props';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/api/error';
import AddUserToCompany from '@/app/api/company/add/company';
import RemoveUserFromCompany from '@/app/api/company/remove/company';
import { TextField } from '@/app/components/modal/field';
import { fetchUsers, removeUser } from '@/redux/slices/users';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';

const UserFormRelation = ({ item, isUpdate }: CreateFormsProps<User>) => {
    const modalName = isUpdate ? 'edit-user-' + item?.id : 'edit-user'
    const modalHandler = useModal();
    const [user, setUser] = useState<User>(item || new User());
    const [error, setError] = useState<RequestError | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    const handleAddUserToCompany = async () => {
        if (!data) return;

        try {
            await AddUserToCompany(user.email, data)
            setError(null);

            dispatch(fetchUsers(data));
            modalHandler.hideModal(modalName);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    const handleRemoveUserFromCompany = async () => {
        if (!data) return;

        try {
            await RemoveUserFromCompany(user.email, data)
            setError(null);

            dispatch(removeUser(user.id))
            modalHandler.hideModal(modalName);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    if (isUpdate && user) {
        return (
            <>
                {error && <p className='text-red-500'>{error.message}</p>}
                <p className='text-gray-600'><strong>Email:</strong> {user.email}</p>
                <p className='text-gray-600'><strong>Nome:</strong> {user.name}</p>
                {user.contact && <p className='text-gray-600'><strong>Telefone:</strong> ({user.contact.ddd}) {user.contact.number}</p>}
                <p className='text-gray-600'><strong>CPF:</strong> {user.cpf}</p>
                <ButtonsModal item={user} name="Usuário" deleteItem={handleRemoveUserFromCompany} />
            </>
        );
    };

    return (
        <>
            {error && <p className='text-red-500'>{error.message}</p>}
            <TextField name="email" friendlyName="Email" placeholder="Digite o e-mail" setValue={value => setUser(prev => ({ ...prev, email: value }))} value={user.email} />
            <ButtonsModal item={user} name="Usuário" onSubmit={handleAddUserToCompany} />
        </>
    );
};

export default UserFormRelation;