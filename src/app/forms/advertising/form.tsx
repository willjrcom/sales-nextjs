'use client';

import React from 'react';
import ButtonsModal from '../../components/modal/buttons-modal';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import CreateAdvertising from '@/app/api/advertising/create';
import UpdateAdvertising from '@/app/api/advertising/update';
import DeleteAdvertising from '@/app/api/advertising/delete';
import GetAllSponsors from '@/app/api/sponsor/list';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DateField, ImageField, TextField } from '@/app/components/modal/field';
import SelectField from '@/app/components/modal/fields/select';
import { Advertising, AdvertisingFormData, SchemaAdvertising } from '@/app/entities/advertising/advertising';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const AdvertisingForm = ({ item, isUpdate }: CreateFormsProps<Advertising>) => {
    const modalName = isUpdate ? 'edit-advertising-' + item?.id : 'new-advertising';
    const modalHandler = useModal();
    const { data } = useSession();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<AdvertisingFormData>({
        resolver: zodResolver(SchemaAdvertising),
        defaultValues: {
            title: item?.title || '',
            description: item?.description || '',
            link: item?.link || '',
            contact: item?.contact || '',
            type: item?.type || 'standard',
            started_at: item?.started_at || null,
            ended_at: item?.ended_at || null,
            cover_image_path: item?.cover_image_path || '',
            sponsor_id: item?.sponsor_id || '',
        }
    });

    const { data: sponsorsResponse } = useQuery({
        queryKey: ['public-sponsors'],
        queryFn: () => GetAllSponsors(data!),
        enabled: !!data?.user?.access_token,
    });

    const sponsors = sponsorsResponse || [];

    const createMutation = useMutation({
        mutationFn: (newAd: AdvertisingFormData) => CreateAdvertising(newAd, data!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['public-advertisements'] });
            notifySuccess(`Propaganda criada com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao criar propaganda');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (updatedAd: AdvertisingFormData) => UpdateAdvertising({ id: item?.id || '', ...updatedAd } as Advertising, data!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['public-advertisements'] });
            notifySuccess(`Propaganda atualizada com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao atualizar propaganda');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => DeleteAdvertising(id, data!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['public-advertisements'] });
            notifySuccess(`Propaganda removida com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || `Erro ao remover propaganda`);
        }
    });

    const onSubmit = (formData: AdvertisingFormData) => {
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
                <div className="space-y-4">
                    <TextField
                        name="title"
                        friendlyName="Título"
                        placeholder="Título da propaganda"
                        setValue={value => setValue('title', value)}
                        value={watch('title')}
                        error={errors.title?.message}
                    />

                    <SelectField
                        friendlyName="Patrocinador"
                        name="sponsor_id"
                        values={sponsors.map(s => ({ id: s.id, name: s.name }))}
                        selectedValue={watch('sponsor_id')}
                        setSelectedValue={value => setValue('sponsor_id', value)}
                        error={errors.sponsor_id?.message}
                    />

                    <SelectField
                        friendlyName="Tipo"
                        name="type"
                        values={[
                            { id: 'standard', name: 'Standard' },
                            { id: 'promotion', name: 'Promotion' },
                            { id: 'discount', name: 'Discount' },
                        ]}
                        selectedValue={watch('type')}
                        setSelectedValue={value => setValue('type', value)}
                        error={errors.type?.message}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DateField
                            friendlyName="Início da Vigência"
                            name="started_at"
                            setValue={value => setValue('started_at', value)}
                            value={watch('started_at') || undefined}
                            error={errors.started_at?.message}
                        />
                        <DateField
                            friendlyName="Fim da Vigência"
                            name="ended_at"
                            setValue={value => setValue('ended_at', value)}
                            value={watch('ended_at') || undefined}
                            error={errors.ended_at?.message}
                        />
                    </div>

                    <TextField
                        name="link"
                        friendlyName="Link"
                        placeholder="https://..."
                        setValue={value => setValue('link', value)}
                        value={watch('link') || ''}
                        error={errors.link?.message}
                    />

                    <TextField
                        name="contact"
                        friendlyName="Contato"
                        placeholder="Telefone/Celular"
                        setValue={value => setValue('contact', value)}
                        value={watch('contact') || ''}
                        error={errors.contact?.message}
                    />

                    <TextField
                        name="description"
                        friendlyName="Descrição"
                        placeholder="Breve descrição da propaganda"
                        setValue={value => setValue('description', value)}
                        value={watch('description') || ''}
                        error={errors.description?.message}
                    />

                    <ImageField
                        friendlyName='Imagem de Capa'
                        name='cover_image_path'
                        setValue={value => setValue('cover_image_path', value || '')}
                        value={watch('cover_image_path') || ''}
                        optional
                        onUploadError={(error) => notifyError(error)}
                    />
                </div>
            </div>

            <div className="mt-6">
                <ButtonsModal
                    item={item || { id: '', title: '' }}
                    name="Propaganda"
                    onSubmit={handleSubmit(onSubmit)}
                    deleteItem={isUpdate ? onDelete : undefined}
                    isPending={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || isSubmitting}
                />
            </div>
        </div>
    );
};

export default AdvertisingForm;
