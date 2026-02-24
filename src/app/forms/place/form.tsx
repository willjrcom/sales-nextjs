'use client';

import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, HiddenField, ImageField, CheckboxField } from '../../components/modal/field';
import Place, { SchemaPlace } from '@/app/entities/place/place';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeletePlace from '@/app/api/place/delete/place';
import NewPlace from '@/app/api/place/new/place';
import UpdatePlace from '@/app/api/place/update/place';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import { useQueryClient } from '@tanstack/react-query';

const PlaceForm = ({ item, isUpdate }: CreateFormsProps<Place>) => {
    const modalName = isUpdate ? 'edit-place-' + item?.id : 'new-place'
    const modalHandler = useModal();
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const [isSaving, setIsSaving] = useState(false);

    const initialValues = useMemo(() => {
        const p = new Place(item);
        return {
            id: p.id,
            name: p.name,
            image_path: p.image_path || '',
            is_active: p.is_active,
            is_available: p.is_available,
        }
    }, [item]);

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<any>({
        resolver: zodResolver(SchemaPlace),
        defaultValues: initialValues
    });

    const place = watch();

    const onInvalid = () => {
        notifyError('Verifique os campos obrigatórios');
    };

    const submit = async (formData: any) => {
        if (!session) return;

        setIsSaving(true);
        try {
            const placeToSave = new Place(formData);
            const response = isUpdate ? await UpdatePlace(placeToSave, session) : await NewPlace(placeToSave, session)

            if (!isUpdate) {
                placeToSave.id = response
                notifySuccess(`Local ${placeToSave.name} criado com sucesso`);
            } else {
                notifySuccess(`Local ${placeToSave.name} atualizado com sucesso`);
            }

            queryClient.invalidateQueries({ queryKey: ['places'] });
            modalHandler.hideModal(modalName);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao salvar local');
        } finally {
            setIsSaving(false);
        }
    }

    const onDelete = async () => {
        if (!session || !place.id) return;
        setIsSaving(true);
        try {
            await DeletePlace(place.id, session);
            queryClient.invalidateQueries({ queryKey: ['places'] });
            notifySuccess(`Local ${place.name} removido com sucesso`);
            modalHandler.hideModal(modalName);
        } catch (error: RequestError | any) {
            notifyError(error.message || `Erro ao remover local ${place.name}`);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="text-black space-y-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações do Local</h3>
                <div className="space-y-4">
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TextField friendlyName='Nome' name='name' setValue={(value: any) => setValue('name', value)} value={place.name} error={errors.name?.message as string} />
                    </div>
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <ImageField
                            friendlyName='Imagem'
                            name='image_path'
                            setValue={(value: any) => setValue('image_path', value)}
                            value={place.image_path}
                            optional
                            onUploadError={(error: string) => notifyError(error)}
                        />
                    </div>
                    {isUpdate && (
                        <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                            <CheckboxField friendlyName='Ativo' name='is_active' setValue={(value: any) => setValue('is_active', value)} value={place.is_active} error={errors.is_active?.message as string} />
                        </div>
                    )}
                </div>
            </div>

            <ButtonsModal item={place} name="Local" onSubmit={handleSubmit(submit, onInvalid)} deleteItem={onDelete} isPending={isSaving} />
        </div>
    );
};

export default PlaceForm;
