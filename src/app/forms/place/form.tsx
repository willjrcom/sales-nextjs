'use client';

import React, { useState } from 'react';
import { TextField, HiddenField, ImageField } from '../../components/modal/field';
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
import { addPlace, removePlace, updatePlace } from '@/redux/slices/places';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';

const PlaceForm = ({ item, isUpdate }: CreateFormsProps<Place>) => {
    const modalName = isUpdate ? 'edit-place-' + item?.id : 'new-place'
    const modalHandler = useModal();
    const [place, setPlace] = useState<Place>(item || new Place());
    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const dispatch = useDispatch<AppDispatch>();
    
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
                dispatch(addPlace(place));
                notifySuccess(`Local ${place.name} criado com sucesso`);
            } else {
                dispatch(updatePlace({ type: "UPDATE", payload: {id: place.id, changes: place}}));
                notifySuccess(`Local ${place.name} atualizado com sucesso`);
            }

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
            dispatch(removePlace(place.id));
            notifySuccess(`Local ${place.name} removido com sucesso`);
            modalHandler.hideModal(modalName);
        } catch (error: RequestError | any) {
            notifyError(error.message || `Erro ao remover local ${place.name}`);
        }
    }

    return (
        <>
            <TextField friendlyName='Nome' name='name' setValue={value => handleInputChange('name', value)} value={place.name}/>
                
            <ImageField 
                friendlyName='Imagem' 
                name='image_path' 
                setValue={value => handleInputChange('image_path', value)} 
                value={place.image_path} 
                optional
                onUploadError={(error) => notifyError(error)}
            />

            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={place.id}/>

            <ErrorForms errors={errors} setErrors={setErrors} />
            <ButtonsModal item={place} name="Local" onSubmit={submit} deleteItem={onDelete} />
        </>
    );
};

export default PlaceForm;
