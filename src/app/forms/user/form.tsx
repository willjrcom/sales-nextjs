import React, { useState } from 'react';
import PersonForm from '../person/form';
import User from '@/app/entities/user/user';
import { useSession } from 'next-auth/react';
import ButtonsModal from '../../components/modal/buttons-modal';
import CreateFormsProps from '../create-forms-props';
import UpdateUser from '@/app/api/user/update/route';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/api/error';
import { ToIsoDate } from '@/app/utils/date';
import Person, { ValidatePersonForm } from '@/app/entities/person/person';

const UserForm = ({ item, isUpdate }: CreateFormsProps<Person>) => {
    const modalName = 'show-user'
    const modalHandler = useModal();
    const [user, setUser] = useState<Person>(item || new Person());
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState<RequestError | null>(null);
    const { data, update } = useSession();

    const submit = async () => {
        if (!data) return;

        if (user.birthday) {
            user.birthday = ToIsoDate(user.birthday)
        }

        const validationErrors = ValidatePersonForm(user);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);
        
        try {
            await UpdateUser(user as User, data)
            setError(null);

            await update({
                ...data,
                user: {
                    ...data.user,
                    person: user
                },
            })

            modalHandler.hideModal(modalName);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    return (
        <>
            {error && <p className='text-red-500'>{error.message}</p>}
            <PersonForm person={user} setPerson={setUser} />
            <ErrorForms errors={errors} />
            <ButtonsModal item={user} name="Funcionário" onSubmit={submit} />
        </>
    );
};

export default UserForm;