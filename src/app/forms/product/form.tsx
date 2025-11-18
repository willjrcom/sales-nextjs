'use client';

import React, { useEffect, useState } from 'react';
import { TextField, CheckboxField, RadioField, HiddenField, ImageField } from '../../components/modal/field';
import Product, { ValidateProductForm } from '@/app/entities/product/product';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import Category from '@/app/entities/category/category';
import CreateFormsProps from '../create-forms-props';
import DeleteProduct from '@/app/api/product/delete/product';
import UpdateProduct from '@/app/api/product/update/product';
import NewProduct from '@/app/api/product/new/product';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import Size from '@/app/entities/size/size';
import { updateCategory } from '@/redux/slices/categories';
import PriceField from '@/app/components/modal/fields/price';
import { notifySuccess, notifyError } from '@/app/utils/notifications';

const ProductForm = ({ item, isUpdate }: CreateFormsProps<Product>) => {
    const modalName = isUpdate ? 'edit-product-' + item?.id : 'new-product'
    const modalHandler = useModal();
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const [product, setProduct] = useState<Product>(item || new Product());
    const [categories, setCategories] = useState<Category[]>([]);
    const [category, setCategory] = useState<Category>(new Category());
    const [size, setSize] = useState<Size>(item?.size || new Size());
    const [recordCategories, setRecordCategories] = useState<Record<string, string>[]>([]);
    const [recordSizes, setRecordSizes] = useState<Record<string, string>[]>([]);
    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const category = categoriesSlice.entities?.[product.category_id];
        if (!category) return
        setCategory(category)
    }, [product.category_id])

    useEffect(() => {
        const size = category.sizes.find(size => size.id === product.size_id);
        if (!size) return
        setSize(size)
    }, [product.size_id]);

    const handleInputChange = (field: keyof Product, value: any) => {
        setProduct(prev => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (!data) return;
        const validationErrors = ValidateProductForm(product);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const response = isUpdate ? await UpdateProduct(product, data) : await NewProduct(product, data);
            
            // prepare plain product data without mutating state entities
            const plainProduct = {
                id: isUpdate ? product.id : response,
                code: product.code,
                image_path: product.image_path,
                name: product.name,
                description: product.description,
                price: product.price,
                cost: product.cost,
                category_id: product.category_id,
                category: category,
                size_id: product.size_id,
                size: size,
                is_available: product.is_available,
            } as Product;

            if (!isUpdate) {
                // add new product to category
                dispatch(updateCategory({
                    type: "UPDATE",
                    payload: {
                        id: category.id,
                        changes: {
                            products: [...(category.products ?? []), plainProduct]
                        }
                    }
                }));
                notifySuccess(`Produto ${product.name} criado com sucesso`);
            } else {
                // update existing product in category
                dispatch(updateCategory({
                    type: "UPDATE",
                    payload: {
                        id: category.id,
                        changes: {
                            products: (category.products ?? []).map(p => p.id === product.id ? plainProduct : p)
                        }
                    }
                }));
                notifySuccess(`Produto ${product.name} atualizado com sucesso`);
            }
            modalHandler.hideModal(modalName);

        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao salvar produto');
        }
    }

    const onDelete = async () => {
        if (!data) return;

        try {
            await DeleteProduct(product.id, data);
            dispatch(updateCategory({
                type: "UPDATE",
                payload: {
                    id: category.id,
                    changes: {
                        products: (category.products ?? []).filter(p => p.id !== product.id)
                    }
                }
            }));
            modalHandler.hideModal(modalName);
            notifySuccess(`Produto ${product.name} removido com sucesso`);
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Erro ao remover produto');
        }
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

            } catch (error: RequestError | any) {
                notifyError(error);
            }
        }

        LoadCategories();
    }, [data?.user.access_token, categoriesSlice.entities]);

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

            } catch (error: RequestError | any) {
                notifyError(error);
            }
        }

        LoadSizes();

    }, [categories, product.category_id, data?.user.access_token])

    return (
        <>
            <TextField friendlyName='Código de busca' name='code' setValue={value => handleInputChange('code', value)} value={product.code} />

            <TextField friendlyName='Nome' name='name' setValue={value => handleInputChange('name', value)} value={product.name} />

            <TextField friendlyName='Descrição' name='description' setValue={value => handleInputChange('description', value)} value={product.description} optional />

            <PriceField friendlyName='Preço' name='price' setValue={value => handleInputChange('price', value)} value={product.price} />

            <PriceField friendlyName='Custo' name='cost' setValue={value => handleInputChange('cost', value)} value={product.cost} optional />

            <ImageField 
                friendlyName='Imagem' 
                name='image_path' 
                setValue={value => handleInputChange('image_path', value)} 
                value={product.image_path} 
                optional
                onUploadError={(error) => notifyError(error)}
            />

            <CheckboxField friendlyName='Disponível' name='is_available' setValue={value => handleInputChange('is_available', value)} value={product.is_available} />

            <RadioField friendlyName='Categorias' name='category_id' setSelectedValue={value => handleInputChange('category_id', value)} selectedValue={product.category_id} values={recordCategories} />

            <RadioField friendlyName='Tamanhos' name='size_id' setSelectedValue={value => handleInputChange('size_id', value)} selectedValue={product.size_id} values={recordSizes} />

            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={product.id} />

            <ErrorForms errors={errors} setErrors={setErrors} />
            <ButtonsModal item={product} name='produto' onSubmit={submit} deleteItem={onDelete} />
        </>
    );
};

export default ProductForm;
