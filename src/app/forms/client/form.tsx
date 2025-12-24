import React, { useEffect } from 'react';
import ButtonsModal from '../../components/modal/buttons-modal';
import { ClientFormData, SchemaClient } from '@/app/entities/client/client';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { ToIsoDate } from '@/app/utils/date';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteClient from '@/app/api/client/delete/client';
import NewClient from '@/app/api/client/new/client';
import UpdateClient from '@/app/api/client/update/client';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DateField, ImageField, TextField } from '@/app/components/modal/field';
import PatternField from '@/app/components/modal/fields/pattern';
import AddressClientForm from '../address/client-form';
import ContactForm from '../contact/form';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ContactType } from '@/app/entities/contact/contact';

const ClientForm = ({ item: client }: CreateFormsProps<ClientFormData | null>) => {
    const isUpdate = !!client?.id;
    const modalName = isUpdate ? 'edit-client-' + client?.id : 'new-client'
    const modalHandler = useModal();
    const { data } = useSession();
    const queryClient = useQueryClient();

    const form = useForm<ClientFormData>({
        resolver: zodResolver(SchemaClient),
        defaultValues: {
            name: '',
            email: '',
            cpf: '',
            birthday: '',
            image_path: '',
            contact: {
                ddd: '',
                number: '',
                type: ContactType.Client,
            },
            address: {
                street: '',
                number: '',
                neighborhood: '',
                complement: '',
                reference: '',
                city: '',
                uf: 'SP',
                cep: '',
                address_type: '',
                delivery_tax: 0,
            },
        },
    })

    const { control, handleSubmit, reset, formState: { errors } } = form;

    useEffect(() => {
        if (client) {
            reset(client)
        }
    }, [client, reset])

    const createMutation = useMutation({
        mutationFn: (newClient: ClientFormData) => NewClient(newClient, data!),
        onSuccess: (response, newClient) => {
            newClient.id = response;
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            notifySuccess(`Cliente ${newClient.name} criado com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao criar cliente');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (updatedClient: ClientFormData) => UpdateClient(updatedClient, data!),
        onSuccess: (_, updatedClient) => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            notifySuccess(`Cliente ${updatedClient.name} atualizado com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao atualizar cliente');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (clientId: string) => DeleteClient(clientId, data!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            notifySuccess(`Cliente ${client?.name} removido com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || `Erro ao remover cliente ${client?.name}`);
        }
    });

    const onSubmit = (formData: ClientFormData) => {
        if (!data) return;

        const processedData = { ...formData };
        
        if (processedData.birthday) {
            processedData.birthday = ToIsoDate(processedData.birthday);
        } else {
            delete processedData.birthday;
        }

        if (isUpdate) {
            updateMutation.mutate(processedData);
        } else {
            createMutation.mutate(processedData);
        }
    }

    const onError = (errors: any) => {
        console.log('Erros de validação:', errors);
        notifyError('Preencha os campos obrigatórios corretamente');
    }

    const onDelete = async () => {
        if (!data || !client?.id) return;
        deleteMutation.mutate(client.id);
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <h2>{isUpdate ? 'Editar Pessoa' : 'Cadastrar Pessoa'}</h2>

                {/* Seção: Informações Básicas */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações Básicas</h3>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                name="name"
                                friendlyName="Nome"
                                placeholder="Digite seu nome"
                                setValue={field.onChange}
                                value={field.value}
                                error={errors.name?.message}
                            />
                        )}
                    />
                </div>
                
                {/* Seção: Contato */}
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 transition-all duration-300 hover:shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-blue-200">Contato</h3>
                    <ContactForm />
                </div>

                {/* Seção: Endereço */}
                <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">Endereço</h3>
                    <AddressClientForm />
                </div>

                {/* Seção: Dados Adicionais */}
                <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg shadow-sm border border-purple-100 p-6 transition-all duration-300 hover:shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">Dados Adicionais</h3>
                    <div className="space-y-4">

                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                            <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            name="email"
                                            friendlyName="Email"
                                            placeholder="Digite seu e-mail"
                                            setValue={field.onChange}
                                            value={field.value || ''}
                                            optional={true}
                                            error={errors.email?.message}
                                        />
                                    )}
                                />
                            </div>
                            <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                                <Controller
                                    name="image_path"
                                    control={control}
                                    render={({ field }) => (
                                        <ImageField
                                            friendlyName='Imagem'
                                            name='image_path'
                                            setValue={field.onChange}
                                            value={field.value || ''}
                                            optional
                                            onUploadError={(error) => notifyError(error)}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                            <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                                <Controller
                                    name="cpf"
                                    control={control}
                                    render={({ field }) => (
                                        <PatternField
                                            patternName="cpf"
                                            name="cpf"
                                            friendlyName="CPF"
                                            placeholder="Digite seu cpf"
                                            setValue={field.onChange}
                                            value={field.value || ''}
                                            optional={true}
                                            formatted={true}
                                        />
                                    )}
                                />
                            </div>
                            <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                                <Controller
                                    name="birthday"
                                    control={control}
                                    render={({ field }) => (
                                        <DateField
                                            name="birthday"
                                            friendlyName="Nascimento"
                                            setValue={field.onChange}
                                            value={field.value || ''}
                                            optional={true}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <button type="submit">
                    {isUpdate ? 'Atualizar' : 'Cadastrar'}
                </button>
                <ButtonsModal
                    item={{ id: client?.id ?? '', name: client?.name }}
                    name="Cliente"
                    onSubmit={handleSubmit(onSubmit)}
                    deleteItem={onDelete}
                />
            </form>
        </FormProvider>
    );

};

export default ClientForm;