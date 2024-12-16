'use client';

import React, { useEffect, useState } from 'react';
import { TextField, NumberField, CheckboxField, RadioField, HiddenField } from '../../components/modal/field';
import Product, { ValidateProductForm } from '@/app/entities/product/product';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import Category from '@/app/entities/category/category';
import CreateFormsProps from '../create-forms-props';
import DeleteProduct from '@/app/api/product/delete/route';
import UpdateProduct from '@/app/api/product/update/route';
import NewProduct from '@/app/api/product/new/route';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/api/error';
import { addProduct, removeProduct, updateProduct } from '@/redux/slices/products';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';

const ProductForm = ({ item, isUpdate }: CreateFormsProps<Product>) => {
    const modalName = isUpdate ? 'edit-product-' + item?.id : 'new-product'
    const modalHandler = useModal();
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const dispatch = useDispatch<AppDispatch>();
    const [product, setProduct] = useState<Product>(item || new Product());
    const [categories, setCategories] = useState<Category[]>([]);
    const [recordCategories, setRecordCategories] = useState<Record<string, string>[]>([]);
    const [recordSizes, setRecordSizes] = useState<Record<string, string>[]>([]);
    const { data } = useSession();
    const [error, setError] = useState<RequestError | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const handleInputChange = (field: keyof Product, value: any) => {
        setProduct(prev => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (!data) return;

        const validationErrors = ValidateProductForm(product);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const response = isUpdate ? await UpdateProduct(product, data) : await NewProduct(product, data);
            setError(null);

            product.category.name = recordCategories.filter(category => category.id === product.category_id)[0].name;
            product.size.name = recordSizes.filter(size => size.id === product.size_id)[0].name;

            if (!isUpdate) {
                product.id = response
                dispatch(addProduct(product));
            } else {
                dispatch(updateProduct({id: product.id, changes: product}));
            }
            modalHandler.hideModal(modalName);
            
        } catch (error) {
            setError(error as RequestError);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteProduct(product.id, data);
        dispatch(removeProduct(product.id));
        modalHandler.hideModal(modalName);
    }

    useEffect(() => {
        const LoadCategories = async () => {
            if (!data) return;

            try {
                setCategories(Object.values(categoriesSlice.entities));

                let records: Record<string, string>[] = [];

                if (Object.values(categoriesSlice.entities).length === 0) {
                    setRecordCategories([]);
                    return;
                }
                
                for (const category of Object.values(categoriesSlice.entities)) {
                    records.push({ id: category.id, name: category.name })
                }
                setRecordCategories(records);

            } catch (error) {
                setError(error as RequestError);
            }
        }

        LoadCategories();
    }, [data, categoriesSlice.entities]);

    useEffect(() => {
        const LoadSizes = async () => {
            if (!data) return;

            try {
                const category = categories.find(category => category.id === product.category_id);
                if (!category) return;

                let records: Record<string, string>[] = [];

                if (!category.sizes) {
                    setRecordSizes([]);
                    return;
                }

                for (const size of category.sizes) {
                    records.push({ id: size.id, name: size.name })
                }
    
                setRecordSizes(records);
                
            } catch (error) {
                setError(error as RequestError);
            }
        }

        LoadSizes();

    }, [categories, product.category_id, data])

    return (
        <>
            <TextField friendlyName='Código de busca' name='code' setValue={value => handleInputChange('code', value)} value={product.code}/>
            <TextField friendlyName='Nome' name='name' setValue={value => handleInputChange('name', value)} value={product.name}/>
            <TextField friendlyName='Descrição' name='description' setValue={value => handleInputChange('description', value)} value={product.description}/>
            <NumberField friendlyName='Preço' name='price' setValue={value => handleInputChange('price', value)} value={product.price}/>
            <NumberField friendlyName='Custo' name='cost' setValue={value => handleInputChange('cost', value)} value={product.cost}/>
            <TextField friendlyName='Imagem' name='image_path' setValue={value => handleInputChange('image_path', value)} value={product.image_path}/>
            <CheckboxField friendlyName='Disponível' name='is_available' setValue={value => handleInputChange('is_available', value)} value={product.is_available}/>
            <RadioField friendlyName='Categorias' name='category_id' setSelectedValue={value => handleInputChange('category_id', value)} selectedValue={product.category_id} values={recordCategories}/>
            <RadioField friendlyName='Tamanhos' name='size_id' setSelectedValue={value => handleInputChange('size_id', value)} selectedValue={product.size_id} values={recordSizes}/>
            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={product.id}/>

            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <ErrorForms errors={errors} />
            <ButtonsModal item={product} name='produto' onSubmit={submit} deleteItem={onDelete} />
        </>
    );
};

export default ProductForm;
