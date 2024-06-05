import React, { useState } from 'react';
import { TextField, NumberField, CheckboxField } from '../field';
import Product from '@/app/entities/product/product';
import ButtonModal from '../buttons-modal';
import { useSession } from 'next-auth/react';
import NewProduct from '@/app/api/product/new/route';

const CreateProductForm = ({ handleCloseModal, reloadData }: CreateFormsProps) => {
    const product: Product = new Product();
    const [code, setCode] = useState(product.code);
    const [name, setName] = useState(product.name);
    const [description, setDescription] = useState(product.description);
    const [price, setPrice] = useState(product.price);
    const [cost, setCost] = useState(product.cost);
    const [isAvailable, setIsAvailable] = useState(product.is_available);
    const { data } = useSession();

    const submit = async () => {
        if (!data) return;
        const response = await NewProduct(product, data)

        if (response) {
            handleCloseModal();
            reloadData();
        }
    }

    return (
        <>
            <TextField friendlyName='Código de busca' name='code' setValue={setCode} value={code}/>
            <TextField friendlyName='Nome' name='name' setValue={setName} value={name}/>
            <TextField friendlyName='Descrição' name='description' setValue={setDescription} value={description}/>
            <NumberField friendlyName='Preço' name='price' setValue={setPrice} value={price}/>
            <NumberField friendlyName='Custo' name='cost' setValue={setCost} value={cost}/>
            <CheckboxField friendlyName='Disponível' name='is_available' setValue={setIsAvailable} value={isAvailable.toString()}/>
            <ButtonModal onSubmit={submit} onCancel={handleCloseModal}/>
        </>
    );
};

export default CreateProductForm;
