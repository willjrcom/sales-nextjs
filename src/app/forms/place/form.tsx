'use client';

import React, { useState } from 'react';
import { TextField, HiddenField } from '../field';
import Place from '@/app/entities/place/place';
import ButtonsModal from '../buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeletePlace from '@/app/api/place/delete/route';
import ModalHandler from '@/app/components/modal/modal';
import { usePlaces } from '@/app/context/place/context';
import NewPlace from '@/app/api/place/new/route';
import UpdatePlace from '@/app/api/place/update/route';

const PlaceForm = ({ item, isUpdate }: CreateFormsProps<Place>) => {
    const modalHandler = ModalHandler();
    const context = usePlaces();
    const place = item || new Place();
    const [id, setId] = useState(place.id);
    const [name, setName] = useState(place.name);
    const [imagePath, setImagePath] = useState(place.image_path);
    const { data } = useSession();
    const [error, setError] = useState<string | null>(null);
    
    const submit = async () => {
        if (!data) return;

        place.id = id;
        place.name = name;
        place.image_path = imagePath

        try {
            const response = isUpdate ? await UpdatePlace(place, data) : await NewPlace(place, data)
    
            if (response) {
                modalHandler.setShowModal(false);
                context.addItem(place);
            }

        } catch (error) {
            setError((error as Error).message);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeletePlace(place.id, data);
        modalHandler.setShowModal(false);
        context.removeItem(place.id)
    }

    return (
        <>
            {error && <p className="mb-4 text-red-500">{error}</p>}
            <TextField friendlyName='Nome' name='name' setValue={setName} value={name}/>
            <TextField friendlyName='Imagem' name='imagePath' setValue={setImagePath} value={imagePath}/>
            <HiddenField name='id' setValue={setId} value={id}/>

            {error && <p className="mb-4 text-red-500">{error}</p>}
            <ButtonsModal isUpdate={place.id !== ''} onSubmit={submit} onDelete={onDelete} onCancel={() =>modalHandler.setShowModal(false)}/>
        </>
    );
};

export default PlaceForm;
