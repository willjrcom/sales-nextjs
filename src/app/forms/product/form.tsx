'use client';

import React, { useEffect, useState } from 'react';
import { TextField, NumberField, CheckboxField, RadioField, HiddenField } from '../../components/modal/field';
import Product, { ValidateProductForm } from '@/app/entities/product/product';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import Category from '@/app/entities/category/category';
import CreateFormsProps from '../create-forms-props';
import DeleteProduct from '@/app/api/product/delete/route';
import { useProducts } from '@/app/context/product/context';
import UpdateProduct from '@/app/api/product/update/route';
import NewProduct from '@/app/api/product/new/route';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/api/error';
import { useCategories } from '@/app/context/category/context';

const ProductForm = ({ item, isUpdate }: CreateFormsProps<Product>) => {
    const modalName = isUpdate ? 'edit-product-' + item?.id : 'new-product'
    const modalHandler = useModal();
    const context = useProducts();
    const contextCategories = useCategories();
    const product = item || new Product();
    const [id, setId] = useState(product.id);
    const [code, setCode] = useState(product.code);
    const [name, setName] = useState(product.name);
    const [description, setDescription] = useState(product.description);
    const [price, setPrice] = useState(product.price);
    const [cost, setCost] = useState(product.cost);
    const [imagePath, setImagePath] = useState(product.image_path || "");
    const [isAvailable, setIsAvailable] = useState(product.is_available);
    const [categoryId, setCategoryId] = useState(product.category_id);
    const [sizeId, setSizeId] = useState(product.size_id);
    const [categories, setCategories] = useState<Category[]>([]);
    const [recordCategories, setRecordCategories] = useState<Record<string, string>[]>([]);
    const [recordSizes, setRecordSizes] = useState<Record<string, string>[]>([]);
    const { data } = useSession();
    const [error, setError] = useState<RequestError | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    
    useEffect(() => {
        console.log(item)
    }, [])
    const submit = async () => {
        if (!data) return;

        product.id = id;
        product.code = code;
        product.name = name;
        product.description = description;
        product.price = price;
        product.cost = cost;
        product.image_path = imagePath;
        product.is_available = isAvailable;
        product.category_id = categoryId;
        product.size_id = sizeId;

        const validationErrors = ValidateProductForm(product);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const response = isUpdate ? await UpdateProduct(product, data) : await NewProduct(product, data);
            setError(null);

            if (!isUpdate) {
                product.id = response
                context.addItem(product);
            } else {
                context.updateItem(product);
            }
            console.log(modalName)
            modalHandler.hideModal(modalName);
            
        } catch (error) {
            setError(error as RequestError);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteProduct(product.id, data);
        context.removeItem(product.id)
        modalHandler.hideModal(modalName);
    }

    useEffect(() => {
        const LoadCategories = async () => {
            console.log()
            if (!data) return;

            try {
                setCategories(contextCategories.items);

                let records: Record<string, string>[] = [];

                if (contextCategories.items.length === 0) {
                    setRecordCategories([]);
                    return;
                }
                
                for (const category of contextCategories.items) {
                    records.push({ id: category.id, name: category.name })
                }
                setRecordCategories(records);

            } catch (error) {
                setError(error as RequestError);
            }
        }

        LoadCategories();
    }, [data, contextCategories]);

    useEffect(() => {
        const LoadSizes = async () => {
            if (!data) return;

            try {
                const category = categories.find(category => category.id === categoryId);
                if (!category) return;

                let records: Record<string, string>[] = [];

                if (!category.sizes) {
                    setRecordSizes([]);
                    return;
                }

                for (const size of category.sizes) {
                    records.push({ id: size.id.toString(), name: size.name })
                }
    
                setRecordSizes(records);
                
            } catch (error) {
                setError(error as RequestError);
            }
        }

        LoadSizes();

    }, [categories, categoryId, data])

    return (
        <>
            <TextField friendlyName='Código de busca' name='code' setValue={setCode} value={code}/>
            <TextField friendlyName='Nome' name='name' setValue={setName} value={name}/>
            <TextField friendlyName='Descrição' name='description' setValue={setDescription} value={description}/>
            <NumberField friendlyName='Preço' name='price' setValue={setPrice} value={price}/>
            <NumberField friendlyName='Custo' name='cost' setValue={setCost} value={cost}/>
            <TextField friendlyName='Imagem' name='image_path' setValue={setImagePath} value={imagePath}/>
            <CheckboxField friendlyName='Disponível' name='is_available' setValue={setIsAvailable} value={isAvailable.toString()}/>
            <RadioField friendlyName='Categorias' name='category_id' setSelectedValue={setCategoryId} selectedValue={categoryId} values={recordCategories}/>
            <RadioField friendlyName='Tamanhos' name='size_id' setSelectedValue={setSizeId} selectedValue={sizeId} values={recordSizes}/>
            <HiddenField name='id' setValue={setId} value={id}/>

            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <ErrorForms errors={errors} />
            <ButtonsModal isUpdate={product.id !== ''} onSubmit={submit} onDelete={onDelete} onCancel={() => modalHandler.hideModal(modalName)}/>
        </>
    );
};

export default ProductForm;
