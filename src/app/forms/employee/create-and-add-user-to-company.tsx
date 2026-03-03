import { notifySuccess, notifyError } from '@/app/utils/notifications';
import User from '@/app/entities/user/user';
import { useSession } from 'next-auth/react';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import { TextField } from '@/app/components/modal/field';
import NewUser from '@/app/api/user/new/user';
import AddUserToCompany from '@/app/api/company/add/company';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PatternField from '@/app/components/modal/fields/pattern';
import NewEmployee from '@/app/api/employee/new/employee';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface CreateAndAddUserToCompanyFormProps {
    cpf: string;
}

const SchemaCreateUser = z.object({
    name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres').max(100, 'Nome precisa ter no máximo 100 caracteres'),
    email: z.string().email('Email inválido'),
    cpf: z.string().min(11, 'CPF precisa ter pelo menos 11 caracteres').max(14, 'CPF precisa ter no máximo 14 caracteres'),
});

type CreateUserFormData = z.infer<typeof SchemaCreateUser>;

const CreateAndAddUserToCompanyForm = ({ cpf }: CreateAndAddUserToCompanyFormProps) => {
    const modalName = 'add-user-to-company'
    const modalHandler = useModal();
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<CreateUserFormData>({
        resolver: zodResolver(SchemaCreateUser),
        defaultValues: {
            name: '',
            email: '',
            cpf: cpf,
        }
    });

    const createMutation = useMutation({
        mutationFn: async (formData: CreateUserFormData) => {
            const newUser = new User();
            Object.assign(newUser, formData);
            const userID = await NewUser(newUser, "", true)
            await AddUserToCompany(formData.email, session!)
            await NewEmployee(userID, session!)
            return formData;
        },
        onSuccess: (_, formData) => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            notifySuccess(`Funcionário ${formData.name} criado com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao criar funcionário');
        }
    });

    const onSubmit = (formData: CreateUserFormData) => {
        if (!session) return;
        createMutation.mutate(formData);
    }

    const onInvalid = () => {
        console.log(errors);
        notifyError('Formulário incompleto. Verifique os campos obrigatórios.');
    };

    return (
        <div className="text-black space-y-6">
            {/* Seção: Informações Básicas */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações Básicas</h3>
                <TextField
                    name="name"
                    friendlyName="Nome"
                    placeholder="Digite seu nome"
                    setValue={value => setValue('name', value)}
                    value={watch('name')}
                    error={errors.name?.message}
                />

                <TextField
                    name="email"
                    friendlyName="Email"
                    placeholder="Digite seu e-mail"
                    setValue={value => setValue('email', value)}
                    value={watch('email')}
                    optional={false}
                    error={errors.email?.message}
                />

                <PatternField
                    patternName="cpf"
                    name="cpf"
                    friendlyName="CPF"
                    placeholder="Digite seu cpf"
                    setValue={value => setValue('cpf', value)}
                    value={watch('cpf')}
                    optional={false}
                    formatted={true}
                    error={errors.cpf?.message}
                />
            </div>

            {/* Botões de Ação */}
            <div className="mt-6">
                <ButtonsModal
                    item={{ id: '', name: watch('name') }}
                    name="Funcionário"
                    onSubmit={handleSubmit(onSubmit, onInvalid)}
                    isPending={createMutation.isPending || isSubmitting}
                />
            </div>
        </div>
    );
};


export default CreateAndAddUserToCompanyForm;