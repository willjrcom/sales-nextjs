import React, { useMemo, useState } from 'react';
import ButtonsModal from '../../components/modal/buttons-modal';
import Client, { ClientFormData, SchemaClient } from '@/app/entities/client/client';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { ToIsoDate } from '@/app/utils/date';
import { useSession } from 'next-auth/react';
import UpdateClient from '@/app/api/client/update/client';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TextField, SelectField } from '@/app/components/modal/field';
import PatternField from '@/app/components/modal/fields/pattern';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Decimal from 'decimal.js';
import GetAddressByCEP from '@/app/api/busca-cep/busca-cep';
import { FaSearch } from 'react-icons/fa';
import { addressUFsWithId } from '@/app/entities/address/utils';

export interface UpdateAddressOrderProps {
    item: Client;
}

const ClientAddressForm = ({ item }: UpdateAddressOrderProps) => {
    const modalName = 'edit-address-order-' + item?.id;
    const modalHandler = useModal();
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [loadingCep, setLoadingCep] = useState(false);

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
        }
    });

    const updateMutation = useMutation({
        mutationFn: (updatedClient: Client) => UpdateClient(updatedClient, session!),
        onSuccess: (_, updatedClient) => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', 'current'] });
            notifySuccess(`Endereço de ${updatedClient.name} atualizado com sucesso`);
            modalHandler.hideModal(modalName);
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
                delivery_tax: new Decimal(formData.delivery_tax || 0)
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
        notifyError('Formulário inválido. Verifique os campos obrigatórios.');
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
            }
        } catch (error) {
            notifyError('Erro ao buscar CEP');
        } finally {
            setLoadingCep(false);
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                    <PatternField
                        patternName='cep'
                        name="cep"
                        friendlyName="Cep"
                        placeholder="00000-000"
                        setValue={value => setValue('cep', value)}
                        value={watch('cep') || ''}
                        optional
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