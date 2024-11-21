import React, { useEffect, useState } from 'react';
import { TextField, NumberField, CheckboxField, RadioField, HiddenField } from '../field';
import Product from '@/app/entities/product/product';
import ButtonsModal from '../buttons-modal';
import { useSession } from 'next-auth/react';
import GetCategories from '@/app/api/category/route';
import Category from '@/app/entities/category/category';
import CreateFormsProps from '../create-forms-props';
import DeleteProduct from '@/app/api/product/delete/route';

const ProductForm = ({ handleCloseModal, onSubmit, item, context }: CreateFormsProps<Product>) => {
    const product = item || new Product();
    const [id, setId] = useState(product.id);
    const [code, setCode] = useState(product.code);
    const [name, setName] = useState(product.name);
    const [description, setDescription] = useState(product.description);
    const [price, setPrice] = useState(product.price);
    const [cost, setCost] = useState(product.cost);
    const [isAvailable, setIsAvailable] = useState(product.is_available);
    const [categoryId, setCategoryId] = useState(product.category_id);
    const [sizeId, setSizeId] = useState(product.size_id);
    const [categories, setCategories] = useState<Category[]>([]);
    const [recordCategories, setRecordCategories] = useState<Record<string, string>[]>([]);
    const [recordSizes, setRecordSizes] = useState<Record<string, string>[]>([]);
    const { data } = useSession();
    const [error, setError] = useState<string | null>(null);
    
    const submit = async () => {
        if (!data) return;

        product.id = id;
        product.code = code;
        product.name = name;
        product.description = description;
        product.price = price;
        product.cost = cost;
        product.is_available = isAvailable;
        product.category_id = categoryId;
        product.size_id = sizeId;

        try {
            const response = await onSubmit(product, data)
    
            if (response) {
                handleCloseModal();
                context.addItem(product);
            }

        } catch (error) {
            setError((error as Error).message);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteProduct(product, data);
        handleCloseModal();
        context.removeItem(product.id)
    }

    useEffect(() => {
        const LoadCategories = async () => {
            if (!data) return;

            try {
                let response = await GetCategories(data);
                setCategories(response);

                let records: Record<string, string>[] = [];
                for (const category of response) {
                    records.push({ id: category.id.toString(), name: category.name })
                }
                setRecordCategories(records);

            } catch (error) {
                setError((error as Error).message);
            }
        }

        LoadCategories();
    }, [data]);

    useEffect(() => {
        const LoadSizes = async () => {
            if (!data) return;

            try {
                const category = categories.find(category => category.id === categoryId);
                if (!category) return;

                let records: Record<string, string>[] = [];

                for (const size of category.sizes) {
                    records.push({ id: size.id.toString(), name: size.name })
                }
    
                setRecordSizes(records);
                
            } catch (error) {
                setError((error as Error).message);
            }
        }

        LoadSizes();

    }, [categories, categoryId, data])

    return (
        <>
            {error && <p className="mb-4 text-red-500">{error}</p>}
            <TextField friendlyName='Código de busca' name='code' setValue={setCode} value={code}/>
            <TextField friendlyName='Nome' name='name' setValue={setName} value={name}/>
            <TextField friendlyName='Descrição' name='description' setValue={setDescription} value={description}/>
            <NumberField friendlyName='Preço' name='price' setValue={setPrice} value={price}/>
            <NumberField friendlyName='Custo' name='cost' setValue={setCost} value={cost}/>
            <CheckboxField friendlyName='Disponível' name='is_available' setValue={setIsAvailable} value={isAvailable.toString()}/>
            <RadioField friendlyName='Categorias' name='category_id' setSelectedValue={setCategoryId} selectedValue={categoryId} values={recordCategories}/>
            <RadioField friendlyName='Tamanhos' name='size_id' setSelectedValue={setSizeId} selectedValue={sizeId} values={recordSizes}/>
            <HiddenField name='id' setValue={setId} value={id}/>

            {error && <p className="mb-4 text-red-500">{error}</p>}
            <ButtonsModal isUpdate={product.id !== ''} onSubmit={submit} onDelete={onDelete} onCancel={handleCloseModal}/>
        </>
    );
};

export default ProductForm;
