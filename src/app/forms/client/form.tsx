import React, { useMemo, useEffect, useState } from 'react';
import ButtonsModal from '../../components/modal/buttons-modal';
import Client, { ClientFormData, SchemaClient } from '@/app/entities/client/client';
import { z } from 'zod';
import PriceField from "@/app/components/modal/fields/price";
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { ToIsoDate, ToUtcDate } from '@/app/utils/date';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteClient from '@/app/api/client/delete/client';
import NewClient from '@/app/api/client/new/client';
import UpdateClient from '@/app/api/client/update/client';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HiddenField, ImageField, TextField, CheckboxField, SelectField } from '@/app/components/modal/field';
import PatternField from '@/app/components/modal/fields/pattern';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Decimal from 'decimal.js';
import GetAddressByCEP from '@/app/api/busca-cep/busca-cep';
import GetShippingFeeByCEP from '@/app/api/client/shipping-fee/cep/[cep]';
import { FaSearch } from 'react-icons/fa';
import GetCompany from '@/app/api/company/company';
import { addressUFsWithId } from '@/app/entities/address/utils';

const ClientForm = ({ item, isUpdate }: CreateFormsProps<Client>) => {
    const modalName = isUpdate ? 'edit-client-' + item?.id : 'new-client'
    const modalHandler = useModal();
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [loadingCep, setLoadingCep] = useState(false);
    const [showManualTax, setShowManualTax] = useState(() => {
        return item?.address?.delivery_tax && new Decimal(item.address.delivery_tax).greaterThan(0);
    });

    const initialData = useMemo(() => {
        const c = new Client(item);
        if (c.birthday) c.birthday = ToUtcDate(c.birthday);
        return c;
    }, [item]);

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<ClientFormData & { is_active: boolean }>({
        resolver: zodResolver(SchemaClient.extend({ is_active: z.boolean() })),
        defaultValues: {
            id: initialData.id,
            name: initialData.name,
            contact: initialData.contact.number,
            image_path: initialData.image_path,
            email: initialData.email,
            cpf: initialData.cpf,
            birthday: initialData.birthday || '',
            street: initialData.address.street,
            number: initialData.address.number,
            neighborhood: initialData.address.neighborhood,
            city: initialData.address.city,
            uf: initialData.address.uf,
            cep: initialData.address.cep,
            complement: initialData.address.complement,
            reference: initialData.address.reference,
            delivery_tax: new Decimal(initialData.address.delivery_tax || 0).toNumber(),
            distance: new Decimal(initialData.address.distance || 0).toNumber(),
            is_active: initialData.is_active,
        }
    });

    const { data: company } = useQuery({
        queryKey: ['company'],
        queryFn: () => GetCompany(session!),
        enabled: !!session?.user?.access_token,
    });

    const currentUf = watch('uf');

    useEffect(() => {
        if (!isUpdate && company?.address?.uf && !currentUf) {
            setValue('uf', company.address.uf);
        }
    }, [company, isUpdate, setValue, currentUf]);

    const createMutation = useMutation({
        mutationFn: (newClient: Client) => NewClient(newClient, session!),
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
        mutationFn: (updatedClient: Client) => UpdateClient(updatedClient, session!),
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
        mutationFn: (clientId: string) => DeleteClient(clientId, session!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            notifySuccess(`Cliente ${initialData.name} removido com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || `Erro ao remover cliente ${initialData.name}`);
        }
    });

    const onSubmit = async (formData: ClientFormData & { is_active: boolean }) => {
        if (!session) return;

        const clientToSave = new Client(initialData);
        Object.assign(clientToSave, {
            ...formData,
            contact: { ...initialData.contact, number: formData.contact },
            address: {
                ...initialData.address,
                street: formData.street,
                number: formData.number,
                neighborhood: formData.neighborhood,
                city: formData.city,
                uf: formData.uf,
                cep: formData.cep,
                complement: formData.complement,
                reference: formData.reference,
                delivery_tax: new Decimal(formData.delivery_tax || 0),
                distance: new Decimal(formData.distance || 0).toNumber()
            }
        });

        if (clientToSave.birthday) {
            clientToSave.birthday = ToIsoDate(clientToSave.birthday)
        } else {
            delete clientToSave.birthday;
        }

        if (!isUpdate) {
            createMutation.mutate(clientToSave);
        } else {
            updateMutation.mutate(clientToSave);
        }
    }

    const onInvalid = () => {
        notifyError('Formulário inválido. Verifique os campos obrigatórios.');
    }

    const onDelete = async () => {
        if (!session || !initialData.id) return;
        deleteMutation.mutate(initialData.id);
    }

    const getAddress = async () => {
        const cep = watch('cep');
        if (!cep) return;

        setLoadingCep(true);
        try {
            const addressFound = await GetAddressByCEP(cep);
            if (addressFound && addressFound.logradouro) {
                setValue('street', addressFound.logradouro);
                setValue('neighborhood', addressFound.bairro);
                setValue('city', addressFound.localidade);
                setValue('uf', addressFound.uf);

                // Get shipping fee
                try {
                    const fee = await GetShippingFeeByCEP(cep, session!);
                    setValue('delivery_tax', fee);
                } catch (feeError) {
                    console.warn("Failed to calculate shipping fee:", feeError);
                }
            }
        } catch (error) {
            notifyError('Erro ao buscar CEP');
        } finally {
            setLoadingCep(false);
        }
    }

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
            </div>

            {/* Seção: Contato */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-blue-200">Contato</h3>
                <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                    <PatternField
                        patternName='full-phone'
                        name="contact"
                        friendlyName="Celular"
                        placeholder="xx xxxx-xxxx"
                        setValue={value => setValue('contact', value)}
                        value={watch('contact')}
                        error={errors.contact?.message}
                    />
                </div>
            </div>

            {/* Seção: Endereço */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">Endereço</h3>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <PatternField
                                patternName='cep'
                                name="cep"
                                friendlyName="Cep"
                                placeholder="00000-000"
                                setValue={value => setValue('cep', value)}
                                value={watch('cep') || ''}
                                formatted={true}
                                error={errors.cep?.message}
                            />
                        </div>
                        <button
                            type="button"
                            className='flex items-center justify-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md disabled:bg-gray-400'
                            onClick={getAddress}
                            disabled={loadingCep}
                        >
                            <FaSearch />&nbsp;<span>{loadingCep ? 'Buscando...' : 'Buscar'}</span>
                        </button>
                    </div>

                    {showManualTax ? (
                        <div className="mt-2">
                            <div className="flex justify-end mb-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowManualTax(false);
                                        setValue('delivery_tax', 0);
                                        if (watch('cep')) getAddress();
                                    }}
                                    className="text-xs text-red-500 hover:text-red-700 underline"
                                >
                                    Desativar e usar cálculo km
                                </button>
                            </div>
                            <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                                <PriceField
                                    name="delivery_tax"
                                    friendlyName="Taxa de Entrega Fixa"
                                    placeholder="Ex: 8.50"
                                    setValue={(val: Decimal) => setValue('delivery_tax', val.toNumber())}
                                    value={watch('delivery_tax') || 0}
                                    optional
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="mt-1 flex flex-col items-start gap-1">
                            {(watch('delivery_tax') || 0) > 0 && (
                                <p className="text-sm text-green-600 font-medium">
                                    Valor estimado (km): R$ {(watch('delivery_tax') || 0).toFixed(2)}
                                </p>
                            )}
                            <button
                                type="button"
                                onClick={() => setShowManualTax(true)}
                                className="text-xs text-blue-500 hover:text-blue-700 underline"
                            >
                                Inserir taxa fixa manualmente
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 sm:flex-[2] transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                name="street"
                                friendlyName="Rua"
                                placeholder="Digite sua rua"
                                setValue={value => setValue('street', value)}
                                value={watch('street')}
                                error={errors.street?.message}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                name="number"
                                friendlyName="Numero"
                                placeholder="Digite o numero"
                                setValue={value => setValue('number', value)}
                                value={watch('number')}
                                error={errors.number?.message}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                name="neighborhood"
                                friendlyName="Bairro"
                                placeholder="Digite o bairro"
                                setValue={value => setValue('neighborhood', value)}
                                value={watch('neighborhood')}
                                error={errors.neighborhood?.message}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                name="complement"
                                friendlyName="Complemento"
                                placeholder="Digite o complemento"
                                setValue={value => setValue('complement', value)}
                                value={watch('complement') || ''}
                                optional
                                error={errors.complement?.message}
                            />
                        </div>
                    </div>

                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TextField
                            name="reference"
                            friendlyName="Referência"
                            placeholder="Digite a referência"
                            setValue={value => setValue('reference', value)}
                            value={watch('reference') || ''}
                            optional
                            error={errors.reference?.message}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 sm:flex-[2] transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                name="city"
                                friendlyName="Cidade"
                                placeholder="Digite a cidade"
                                setValue={value => setValue('city', value)}
                                value={watch('city')}
                                error={errors.city?.message}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <SelectField
                                name="uf"
                                friendlyName="Estado"
                                setSelectedValue={value => setValue('uf', value)}
                                selectedValue={watch('uf')}
                                values={addressUFsWithId}
                            />
                            {errors.uf && <p className="text-red-500 text-xs italic mt-1">{errors.uf.message}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Seção: Dados Adicionais */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg shadow-sm border border-purple-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">Dados Adicionais</h3>
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                name="email"
                                friendlyName="Email"
                                placeholder="Digite seu e-mail"
                                setValue={value => setValue('email', value)}
                                value={watch('email') || ''}
                                optional={true}
                                error={errors.email?.message}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <ImageField
                                friendlyName='Imagem'
                                name='image_path'
                                setValue={value => setValue('image_path', value)}
                                value={watch('image_path') || ''}
                                optional
                                onUploadError={(error) => notifyError(error)}
                                error={errors.image_path?.message}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <PatternField
                                patternName="cpf"
                                name="cpf"
                                friendlyName="CPF"
                                placeholder="Digite seu cpf"
                                setValue={value => setValue('cpf', value)}
                                value={watch('cpf') || ''}
                                optional={true}
                                formatted={true}
                                error={errors.cpf?.message}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <PatternField
                                patternName="date"
                                name="birthday"
                                friendlyName="Nascimento"
                                setValue={value => setValue('birthday', value)}
                                value={watch('birthday') || ''}
                                optional={true}
                                formatted={true}
                                error={errors.birthday?.message}
                            />
                        </div>
                    </div>
                    {isUpdate && (
                        <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                            <CheckboxField
                                friendlyName='Ativo'
                                name='is_active'
                                setValue={(value: boolean) => setValue('is_active', value)}
                                value={watch('is_active')}
                            />
                        </div>
                    )}
                </div>
            </div>

            <HiddenField
                name="id"
                setValue={(value: any) => setValue("id", value)}
                value={watch('id') || ''}
            />

            {/* Botões de Ação */}
            <div className="mt-6">
                <ButtonsModal
                    item={initialData}
                    name="Cliente"
                    onSubmit={handleSubmit(onSubmit, onInvalid)}
                    deleteItem={onDelete}
                    isPending={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || isSubmitting}
                />
            </div>
        </div>
    );
};

export default ClientForm;