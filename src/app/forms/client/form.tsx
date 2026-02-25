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
import GetShippingFeeByCEP from '@/app/api/client/shipping-fee/cep/[cep]';
import GetCompany from '@/app/api/company/company';
import { addressUFsWithId } from '@/app/entities/address/utils';
import AddressAutocomplete, { ParsedAddress } from '@/app/components/modal/fields/address-autocomplete';

const ClientForm = ({ item, isUpdate }: CreateFormsProps<Client>) => {
    const modalName = isUpdate ? 'edit-client-' + item?.id : 'new-client'
    const modalHandler = useModal();
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [showManualTax, setShowManualTax] = useState(() => {
        return item?.address?.delivery_tax && new Decimal(item.address.delivery_tax).greaterThan(0);
    });
    const [addressSelected, setAddressSelected] = useState(() => {
        return !!(item?.address?.street);
    });
    const [showDadosAdicionais, setShowDadosAdicionais] = useState(false);

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

    const handleAddressSelected = async (parsed: ParsedAddress) => {
        setValue('street', parsed.street);
        setValue('number', parsed.number);
        setValue('neighborhood', parsed.neighborhood);
        setValue('city', parsed.city);
        setValue('uf', parsed.uf);
        if (parsed.cep) setValue('cep', parsed.cep);
        setAddressSelected(true);

        if (parsed.cep && session) {
            try {
                const distance = await GetShippingFeeByCEP(parsed.cep, session);
                setValue('distance', Number(distance));
                // Reset manual tax — will use km-based calculation
                if (!showManualTax) setValue('delivery_tax', 0);
            } catch (feeError) {
                console.warn('Failed to calculate distance:', feeError);
            }
        }
    }

    const handleCepChange = async (cep: string) => {
        setValue('cep', cep);
        if (cep.length === 8 && session) {
            try {
                const distance = await GetShippingFeeByCEP(cep, session);
                setValue('distance', Number(distance));
                if (!showManualTax) setValue('delivery_tax', 0);
            } catch (feeError) {
                console.warn('Failed to recalculate distance for CEP:', feeError);
            }
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
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <AddressAutocomplete
                            onAddressSelected={handleAddressSelected}
                            onCepChange={handleCepChange}
                            onManualEntry={() => setAddressSelected(true)}
                            placeholder="Ex: Rua das Flores, 123, São Paulo"
                            defaultValue={item?.address ? `${item.address.street} ${item.address.number}, ${item.address.city}` : ''}
                            defaultCep={item?.address?.cep || ''}
                        />
                    </div>

                    {addressSelected && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            {showManualTax ? (
                                <div className="mt-2">
                                    <div className="flex justify-end mb-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowManualTax(false);
                                                setValue('delivery_tax', 0);
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
                                    {Number(watch('distance') || 0) > 0 && (() => {
                                        const distKm = Number(watch('distance') || 0);
                                        const feePerKm = new Decimal(company?.preferences?.delivery_fee_per_km || '0');
                                        const minTax = new Decimal(company?.preferences?.min_delivery_tax || '0');
                                        const estimated = Decimal.max(feePerKm.mul(distKm), minTax);
                                        return (
                                            <div className="text-sm text-green-600 font-medium space-y-0.5">
                                                <p>Distância: ~{distKm.toFixed(2)} km <span className="text-xs font-normal text-gray-400">(estimativa por CEP)</span></p>
                                                {estimated.greaterThan(0) && (
                                                    estimated.equals(minTax) && minTax.greaterThan(feePerKm.mul(distKm))
                                                        ? <p>Taxa mínima de entrega: R$ {estimated.toFixed(2)}</p>
                                                        : <p>Taxa estimada: ~R$ {estimated.toFixed(2)}</p>
                                                )}
                                            </div>
                                        );
                                    })()}
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
                    )}
                </div>
            </div>

            {/* Seção: Dados Adicionais */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg shadow-sm border border-purple-100 transition-all duration-300 hover:shadow-md overflow-hidden">
                <button
                    type="button"
                    onClick={() => setShowDadosAdicionais(v => !v)}
                    className="w-full flex items-center justify-between p-6 text-left"
                >
                    <h3 className="text-lg font-semibold text-gray-800">Dados Adicionais</h3>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 text-purple-400 transition-transform duration-200 ${showDadosAdicionais ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {showDadosAdicionais && (
                    <div className="px-6 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
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
                )}
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