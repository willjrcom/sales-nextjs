import React, { useMemo, useState, useEffect } from 'react';
import ButtonsModal from '../../components/modal/buttons-modal';
import Client, { ClientFormData, SchemaClient } from '@/app/entities/client/client';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { ToIsoDate } from '@/app/utils/date';
import { useSession } from 'next-auth/react';
import UpdateClient from '@/app/api/client/update/client';
import UpdateAddressOrderDelivery from '@/app/api/order-delivery/update/address/order-delivery';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TextField, SelectField } from '@/app/components/modal/field';
import PatternField from '@/app/components/modal/fields/pattern';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Decimal from 'decimal.js';
import GetAddressByCEP from '@/app/api/busca-cep/busca-cep';
import { addressUFsWithId } from '@/app/entities/address/utils';
import AddressAutocomplete, { ParsedAddress } from '@/app/components/modal/fields/address-autocomplete';
import GetShippingFeeByCEP from '@/app/api/client/shipping-fee/cep/[cep]';
import GetCompany from '@/app/api/company/company';
import PriceField from "@/app/components/modal/fields/price";

export interface UpdateAddressOrderProps {
    item: Client;
    deliveryId?: string;
}

const ClientAddressForm = ({ item, deliveryId }: UpdateAddressOrderProps) => {
    const modalName = 'edit-address-order-' + item?.id;
    const modalHandler = useModal();
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [showManualTax, setShowManualTax] = useState(() => {
        return item?.address?.delivery_tax && new Decimal(item.address.delivery_tax).greaterThan(0);
    });
    const [addressSelected, setAddressSelected] = useState(() => {
        return !!(item?.address?.street);
    });

    const initialData = useMemo(() => new Client(item), [item]);

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<ClientFormData>({
        resolver: zodResolver(SchemaClient),
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
        }
    });

    const { data: company } = useQuery({
        queryKey: ['company'],
        queryFn: () => GetCompany(session!),
        enabled: !!session?.user?.access_token,
    });

    const updateMutation = useMutation({
        mutationFn: (updatedClient: Client) => UpdateClient(updatedClient, session!),
        onSuccess: async (_, updatedClient) => {
            if (deliveryId && session) {
                try {
                    await UpdateAddressOrderDelivery(deliveryId, session);
                    queryClient.invalidateQueries({ queryKey: ['order', 'current'] });
                    notifySuccess(`Endereço de ${updatedClient.name} atualizado com sucesso`);
                    modalHandler.hideModal(modalName);
                } catch (deliveryError) {
                    const err = deliveryError as RequestError;
                    notifyError(err.message || 'Erro ao atualizar endereço de entrega');
                    return
                }
            }
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao atualizar endereço');
        }
    });

    const onSubmit = async (formData: ClientFormData) => {
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

        updateMutation.mutate(clientToSave);
    }

    const onInvalid = () => {
        console.log(errors);
        notifyError('Formulário inválido. Verifique os campos obrigatórios.');
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
                const addressData = await GetAddressByCEP(cep);
                if (addressData) {
                    setValue('street', addressData.logradouro);
                    setValue('neighborhood', addressData.bairro);
                    setValue('city', addressData.localidade);
                    setValue('uf', addressData.uf);
                    setAddressSelected(true);
                }

                const distance = await GetShippingFeeByCEP(cep, session);
                setValue('distance', Number(distance));
                if (!showManualTax) setValue('delivery_tax', 0);
            } catch (feeError) {
                console.warn('Failed to recalculate address or distance for CEP:', feeError);
            }
        }
    }

    return (
        <div className="text-black space-y-6">
            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">Endereço de Entrega</h3>

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
                                <div className="flex-1 sm:flex-[2.5] transform transition-transform duration-200 hover:scale-[1.01]">
                                    <TextField
                                        name="street"
                                        friendlyName="Rua"
                                        placeholder="Selecione no autocomplete ou preencha o CEP"
                                        setValue={value => setValue('street', value)}
                                        value={watch('street')}
                                        disabled={true}
                                        error={errors.street?.message}
                                    />
                                    <p className="text-xs text-muted-foreground">Carregado através do cep</p>
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

            <div className="mt-6">
                <ButtonsModal
                    item={initialData}
                    name="Endereço"
                    onSubmit={handleSubmit(onSubmit, onInvalid)}
                    isPending={updateMutation.isPending || isSubmitting}
                />
            </div>
        </div>
    );
};

export default ClientAddressForm;