'use client';

import React from 'react';
import ButtonsModal from '../../components/modal/buttons-modal';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import CreateSponsor from '@/app/api/sponsor/create';
import UpdateSponsor from '@/app/api/sponsor/update';
import DeleteSponsor from '@/app/api/sponsor/delete';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TextField } from '@/app/components/modal/field';
import { Sponsor, SponsorFormData, SchemaSponsor } from '@/app/entities/sponsor/sponsor';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Address from '@/app/entities/address/address';

const SponsorForm = ({ item, isUpdate }: CreateFormsProps<Sponsor>) => {
    const modalName = isUpdate ? 'edit-sponsor-' + item?.id : 'new-sponsor';
    const modalHandler = useModal();
    const { data } = useSession();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<SponsorFormData>({
        resolver: zodResolver(SchemaSponsor),
        defaultValues: {
            name: item?.name || '',
            cnpj: item?.cnpj || '',
            email: item?.email || '',
            contact: item?.contact || '',
            address: {
                street: item?.address?.street || '',
                number: item?.address?.number || '',
                neighborhood: item?.address?.neighborhood || '',
                city: item?.address?.city || '',
                uf: item?.address?.uf || '',
                cep: item?.address?.cep || '',
                delivery_tax: 0,
            },
        }
    });

    const createMutation = useMutation({
        mutationFn: (newSponsor: SponsorFormData) => CreateSponsor(newSponsor, data!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['public-sponsors'] });
            notifySuccess(`Patrocinador criado com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao criar patrocinador');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (updatedSponsor: SponsorFormData) => UpdateSponsor({ id: item?.id || '', ...updatedSponsor } as Sponsor, data!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['public-sponsors'] });
            notifySuccess(`Patrocinador atualizado com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao atualizar patrocinador');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => DeleteSponsor(id, data!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['public-sponsors'] });
            notifySuccess(`Patrocinador removido com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || `Erro ao remover patrocinador`);
        }
    });

    const onSubmit = (formData: SponsorFormData) => {
        if (!data) return;

        if (!isUpdate) {
            createMutation.mutate(formData);
        } else {
            updateMutation.mutate(formData);
        }
    }

    const onDelete = async () => {
        if (!data || !item?.id) return;
        deleteMutation.mutate(item.id);
    }

    return (
        <div className="text-black space-y-6">
            <div className="bg-white rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                        name="name"
                        friendlyName="Nome"
                        placeholder="Nome do patrocinador"
                        setValue={value => setValue('name', value)}
                        value={watch('name')}
                        error={errors.name?.message}
                    />
                    <TextField
                        name="cnpj"
                        friendlyName="CNPJ"
                        placeholder="CNPJ"
                        setValue={value => setValue('cnpj', value)}
                        value={watch('cnpj')}
                        error={errors.cnpj?.message}
                    />
                    <TextField
                        name="email"
                        friendlyName="Email"
                        placeholder="Email de contato"
                        setValue={value => setValue('email', value)}
                        value={watch('email')}
                        error={errors.email?.message}
                    />
                    <TextField
                        name="contact"
                        friendlyName="Contato"
                        placeholder="Telefone/Celular"
                        setValue={value => setValue('contact', value)}
                        value={watch('contact')}
                        error={errors.contact?.message}
                    />
                </div>

                <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Endereço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextField
                            name="address.street"
                            friendlyName="Rua"
                            setValue={value => setValue('address.street', value)}
                            value={watch('address.street') || ''}
                            error={errors.address?.street?.message}
                        />
                        <TextField
                            name="address.number"
                            friendlyName="Número"
                            setValue={value => setValue('address.number', value)}
                            value={watch('address.number') || ''}
                            error={errors.address?.number?.message}
                        />
                        <TextField
                            name="address.neighborhood"
                            friendlyName="Bairro"
                            setValue={value => setValue('address.neighborhood', value)}
                            value={watch('address.neighborhood') || ''}
                            error={errors.address?.neighborhood?.message}
                        />
                        <TextField
                            name="address.city"
                            friendlyName="Cidade"
                            setValue={value => setValue('address.city', value)}
                            value={watch('address.city') || ''}
                            error={errors.address?.city?.message}
                        />
                        <TextField
                            name="address.uf"
                            friendlyName="UF"
                            setValue={value => setValue('address.uf', value)}
                            value={watch('address.uf') || ''}
                            error={errors.address?.uf?.message}
                        />
                        <TextField
                            name="address.cep"
                            friendlyName="CEP"
                            setValue={value => setValue('address.cep', value)}
                            value={watch('address.cep') || ''}
                            error={errors.address?.cep?.message}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <ButtonsModal
                    item={item || { id: '', name: '', cnpj: '' }}
                    name="Patrocinador"
                    onSubmit={handleSubmit(onSubmit) as any}
                    deleteItem={isUpdate ? onDelete : undefined}
                    isPending={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || isSubmitting}
                />
            </div>
        </div>
    );
};

export default SponsorForm;
