import { useCallback, useState } from 'react';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import User, { ValidateUserFormCreate } from '@/app/entities/user/user';
import { useSession } from 'next-auth/react';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { TextField } from '@/app/components/modal/field';
import NewUser from '@/app/api/user/new/user';
import AddUserToCompany from '@/app/api/company/add/company';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PatternField from '@/app/components/modal/fields/pattern';
import NewEmployee from '@/app/api/employee/new/employee';

interface CreateAndAddUserToCompanyFormProps {
    cpf: string;
}

const CreateAndAddUserToCompanyForm = ({ cpf }: CreateAndAddUserToCompanyFormProps) => {
    const modalName = 'add-user-to-company'
    const modalHandler = useModal();
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const queryClient = useQueryClient();
    const { data } = useSession();

    const [user, setUser] = useState<User>(() => {
        const e = new User();
        e.cpf = cpf;
        return e;
    });

    const handleInputChange = useCallback((field: keyof User, value: any) => {
        setUser(prev => ({
            ...prev,
            [field]: value
        } as User));
    }, [user]);

    const createMutation = useMutation({
        mutationFn: async (newUser: User) => {
            const userID = await NewUser(newUser, "", true)
            await AddUserToCompany(newUser.email, data!)
            await NewEmployee(userID, data!)
        },
        onSuccess: (_, newUser) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            notifySuccess(`Funcionário ${newUser.name} criado com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao criar cliente');
        }
    });

    const createUserAndUser = async () => {
        if (!data) return;
        const newUser = new User();
        Object.assign(newUser, { ...user });

        const validationErrors = ValidateUserFormCreate(newUser);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        createMutation.mutate(newUser);
    }

    return (
        <div className="text-black space-y-6">
            {/* Seção: Informações Básicas */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações Básicas</h3>
                <TextField name="name" friendlyName="Nome" placeholder="Digite seu nome" setValue={value => handleInputChange('name', value)} value={user.name} />

                <TextField name="email" friendlyName="Email" placeholder="Digite seu e-mail" setValue={value => handleInputChange('email', value)} value={user.email} optional={false} />

                <PatternField patternName="cpf" name="cpf" friendlyName="CPF" placeholder="Digite seu cpf" setValue={value => handleInputChange('cpf', value)} value={user.cpf || ''} optional={false} formatted={true} />
            </div>

            <ErrorForms errors={errors} setErrors={setErrors} />

            {/* Botões de Ação */}
            <div className="mt-6">
                <ButtonsModal
                    item={user}
                    name="Funcionário"
                    onSubmit={createUserAndUser}
                />
            </div>
        </div>
    );
};


export default CreateAndAddUserToCompanyForm;