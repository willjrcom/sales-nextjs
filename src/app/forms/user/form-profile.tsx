import React, { useState } from 'react';
import PersonForm from '../person/form';
import User from '@/app/entities/user/user';
import { useSession } from 'next-auth/react';
import ButtonsModal from '../../components/modal/buttons-modal';
import CreateFormsProps from '../create-forms-props';
import UpdateUser from '@/app/api/user/update/user';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { ToIsoDate } from '@/app/utils/date';
import Person, { ValidatePersonForm } from '@/app/entities/person/person';

const UserForm = ({ item }: CreateFormsProps<User>) => {
    const modalName = 'show-user'
    const modalHandler = useModal();
    const [user, setUser] = useState<User>(item || new User());
    const [person, setPerson] = useState<Person>(user as Person);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const { data, update } = useSession();

    const submit = async () => {
        if (!data) return;

        let newUser: User = { ...user, ...person }

        if (newUser.birthday) {
            newUser.birthday = ToIsoDate(newUser.birthday)
        }

        const validationErrors = ValidatePersonForm(newUser);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);
        
        try {
            await UpdateUser(newUser, data)
            await update({
                ...data,
                user: {
                    ...data.user,
                    user: newUser
                },
            })
            notifySuccess('Perfil atualizado com sucesso');
            modalHandler.hideModal(modalName);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao atualizar perfil');
        }
    }

    return (
        <>
            <PersonForm person={person} setPerson={setPerson} isEmployee />
            <ErrorForms errors={errors} setErrors={setErrors} />
            <ButtonsModal item={user} name="Usuário" onSubmit={submit} />
        </>
    );
};

export default UserForm;