'use client';

import React, { useState } from 'react';
import { TextField, HiddenField } from '../field';
import Place, { ValidatePlaceForm } from '@/app/entities/place/place';
import ButtonsModal from '../buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeletePlace from '@/app/api/place/delete/route';
import { usePlaces } from '@/app/context/place/context';
import NewPlace from '@/app/api/place/new/route';
import UpdatePlace from '@/app/api/place/update/route';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../error-forms';

const PlaceForm = ({ item, isUpdate }: CreateFormsProps<Place>) => {
    const modalName = isUpdate ? 'edit-place' : 'new-place'
    const modalHandler = useModal();
    const context = usePlaces();
    const place = item || new Place();
    const [id, setId] = useState(place.id);
    const [name, setName] = useState(place.name);
    const [imagePath, setImagePath] = useState(place.image_path);
    const { data } = useSession();
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    
    const submit = async () => {
        if (!data) return;

        place.id = id;
        place.name = name;
        place.image_path = imagePath

        const validationErrors = ValidatePlaceForm(place);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const response = isUpdate ? await UpdatePlace(place, data) : await NewPlace(place, data)
    
            if (!isUpdate) {
                place.id = response
                context.addItem(place);
            } else {
                context.updateItem(place);
            }

            modalHandler.hideModal(modalName);

        } catch (error) {
            setError((error as Error).message);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeletePlace(place.id, data);
        context.removeItem(place.id)
        modalHandler.hideModal(modalName);
    }

    return (
        <>
            {error && <p className="mb-4 text-red-500">{error}</p>}
            <TextField friendlyName='Nome' name='name' setValue={setName} value={name}/>
            <TextField friendlyName='Imagem' name='imagePath' setValue={setImagePath} value={imagePath}/>
            <HiddenField name='id' setValue={setId} value={id}/>

            <ErrorForms errors={errors} />
            <ButtonsModal isUpdate={place.id !== ''} onSubmit={submit} onDelete={onDelete} onCancel={() =>modalHandler.hideModal(modalName)}/>
        </>
    );
};

export default PlaceForm;
