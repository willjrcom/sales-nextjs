'use client';

import React, { useState } from 'react';
import { TextField, HiddenField, ImageField, CheckboxField } from '../../components/modal/field';
import Place, { ValidatePlaceForm } from '@/app/entities/place/place';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeletePlace from '@/app/api/place/delete/place';
import NewPlace from '@/app/api/place/new/place';
import UpdatePlace from '@/app/api/place/update/place';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { useQueryClient } from '@tanstack/react-query';

const PlaceForm = ({ item, isUpdate }: CreateFormsProps<Place>) => {
    const modalName = isUpdate ? 'edit-place-' + item?.id : 'new-place'
    const modalHandler = useModal();
    const [place, setPlace] = useState<Place>(item || new Place());
    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const queryClient = useQueryClient();

    const handleInputChange = (field: keyof Place, value: any) => {
        setPlace(prev => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (!data) return;

        const validationErrors = ValidatePlaceForm(place);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const response = isUpdate ? await UpdatePlace(place, data) : await NewPlace(place, data)

            if (!isUpdate) {
                place.id = response
                notifySuccess(`Local ${place.name} criado com sucesso`);
            } else {
                notifySuccess(`Local ${place.name} atualizado com sucesso`);
            }

            queryClient.invalidateQueries({ queryKey: ['places'] });
            modalHandler.hideModal(modalName);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao salvar local');
        }
    }

    const onDelete = async () => {
        if (!data) return;
        try {
            await DeletePlace(place.id, data);
            queryClient.invalidateQueries({ queryKey: ['places'] });
            notifySuccess(`Local ${place.name} removido com sucesso`);
            modalHandler.hideModal(modalName);
        } catch (error: RequestError | any) {
            notifyError(error.message || `Erro ao remover local ${place.name}`);
        }
    }

    return (
        <div className="text-black space-y-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações do Local</h3>
                <div className="space-y-4">
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TextField friendlyName='Nome' name='name' setValue={value => handleInputChange('name', value)} value={place.name} />
                    </div>
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <ImageField
                            friendlyName='Imagem'
                            name='image_path'
                            setValue={value => handleInputChange('image_path', value)}
                            value={place.image_path}
                            optional
                            onUploadError={(error) => notifyError(error)}
                        />
                    </div>
                    {isUpdate && (
                        <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                            <CheckboxField friendlyName='Ativo' name='is_active' setValue={value => handleInputChange('is_active', value)} value={place.is_active} />
                        </div>
                    )}
                </div>
            </div>

            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={place.id} />

            <ErrorForms errors={errors} setErrors={setErrors} />
            <ButtonsModal item={place} name="Local" onSubmit={submit} />
        </div>
    );
};

export default PlaceForm;
