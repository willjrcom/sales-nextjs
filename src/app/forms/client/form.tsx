import React, { useCallback, useEffect, useState } from 'react';
import ButtonsModal from '../../components/modal/buttons-modal';
import Client, { ValidateClientForm } from '@/app/entities/client/client';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { ToIsoDate } from '@/app/utils/date';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteClient from '@/app/api/client/delete/client';
import NewClient from '@/app/api/client/new/client';
import UpdateClient from '@/app/api/client/update/client';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DateField, HiddenField, ImageField, TextField } from '@/app/components/modal/field';
import PatternField from '@/app/components/modal/fields/pattern';
import Contact from '@/app/entities/contact/contact';
import Address from '@/app/entities/address/address';
import ContactForm from '../contact/form';
import AddressClientForm from '../address/client-form';

const ClientForm = ({ item, isUpdate }: CreateFormsProps<Client>) => {
    const modalName = isUpdate ? 'edit-client-' + item?.id : 'new-client'
    const modalHandler = useModal();
    const [client, setClient] = useState<Client>(item || new Client())
    const [contact, setContact] = useState<Contact>(client.contact || new Contact())
    const [address, setAddress] = useState<Address>(client.address || new Address())
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const { data } = useSession();
    const queryClient = useQueryClient();

    const handleInputChange = useCallback((field: keyof Client, value: any) => {
        setClient(prev => ({
            ...prev,
            [field]: value
        } as Client));
    }, [setClient]);

    useEffect(() => {
        handleInputChange('address', address);
    }, [address]);

    useEffect(() => {
        handleInputChange('contact', contact);
    }, [contact]);

    const createMutation = useMutation({
        mutationFn: (newClient: Client) => NewClient(newClient, data!),
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
        mutationFn: (updatedClient: Client) => UpdateClient(updatedClient, data!),
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

    const submit = async () => {
        if (!data) return;

        const newClient = { ...client };

        if (newClient.birthday) {
            newClient.birthday = ToIsoDate(newClient.birthday)
        } else {
            // Remove o campo birthday se estiver vazio, pois o backend usa ponteiro
            delete newClient.birthday;
        }

        const validationErrors = ValidateClientForm(newClient);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        if (!isUpdate) {
            createMutation.mutate(newClient);
        } else {
            updateMutation.mutate(newClient);
        }
    }

    const onDelete = async () => {
        if (!data || !client?.id) return;
        deleteMutation.mutate(client.id);
    }

    return (
        <div className="text-black space-y-6">
            {/* Seção: Informações Básicas */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações Básicas</h3>
                <TextField name="name" friendlyName="Nome" placeholder="Digite seu nome" setValue={value => handleInputChange('name', value)} value={client.name} />
            </div>

            {/* Seção: Contato */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-blue-200">Contato</h3>
                <ContactForm contactParent={contact} setContactParent={setContact} />
            </div>

            {/* Seção: Endereço */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">Endereço</h3>
                <AddressClientForm addressParent={address} setAddressParent={setAddress} />
            </div>

            {/* Seção: Dados Adicionais */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg shadow-sm border border-purple-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">Dados Adicionais</h3>
                <div className="space-y-4">

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField name="email" friendlyName="Email" placeholder="Digite seu e-mail" setValue={value => handleInputChange('email', value)} value={client.email} optional={true} />

                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <ImageField
                                friendlyName='Imagem'
                                name='image_path'
                                setValue={value => handleInputChange('image_path', value)}
                                value={client.image_path}
                                optional
                                onUploadError={(error) => notifyError(error)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <PatternField patternName="cpf" name="cpf" friendlyName="CPF" placeholder="Digite seu cpf" setValue={value => handleInputChange('cpf', value)} value={client.cpf || ''} optional={true} formatted={true} />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <DateField name="birthday" friendlyName="Nascimento" setValue={value => handleInputChange('birthday', value)} value={client.birthday} optional={true} />
                        </div>
                    </div>
                </div>
            </div>

            <HiddenField
                name="id"
                setValue={(value) => handleInputChange("id", value)}
                value={client.id}
            />
            <ErrorForms errors={errors} setErrors={setErrors} />

            {/* Botões de Ação */}
            <div className="mt-6">
                <ButtonsModal
                    item={client}
                    name="Cliente"
                    onSubmit={submit}
                    deleteItem={onDelete}
                />
            </div>
        </div>
    );
};

export default ClientForm;