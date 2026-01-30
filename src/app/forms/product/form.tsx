'use client';

import { useState, useMemo } from 'react';
import { TextField, CheckboxField, RadioField, HiddenField, ImageField } from '../../components/modal/field';
import Product, { ValidateProductForm } from '@/app/entities/product/product';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteProduct from '@/app/api/product/delete/product';
import UpdateProduct from '@/app/api/product/update/product';
import NewProduct from '@/app/api/product/new/product';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import PriceField from '@/app/components/modal/fields/price';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GetCategoriesMap } from '@/app/api/category/category';
import GetSizesByCategoryID from '@/app/api/size/size';

const ProductForm = ({ item, isUpdate }: CreateFormsProps<Product>) => {
    const modalName = isUpdate ? 'edit-product-' + item?.id : 'new-product'
    const modalHandler = useModal();
    const queryClient = useQueryClient();
    const { data } = useSession();
    const [product, setProduct] = useState<Product>(new Product(item));
    const [flavorsInput, setFlavorsInput] = useState<string>(item?.flavors?.join(', ') || '');
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories', 'map', 'product'],
        queryFn: () => GetCategoriesMap(data!, true),
        enabled: !!data?.user?.access_token,
        refetchInterval: 60000,
    });

    const { data: sizesResponse } = useQuery({
        queryKey: ['sizes', product.category_id],
        queryFn: () => GetSizesByCategoryID(data!, product.category_id),
        enabled: !!data?.user?.access_token && !!product.category_id,
        refetchInterval: 60000,
    });

    const categories = useMemo(() => categoriesResponse || [], [categoriesResponse]);
    const sizes = useMemo(() => sizesResponse || [], [sizesResponse]);

    const handleInputChange = (field: keyof Product, value: any) => {
        setProduct(prev => ({ ...prev, [field]: value }));
    };

    const handleFlavorsChange = (value: string) => {
        setFlavorsInput(value);
        const parsedFlavors = value.split(',')
            .map(flavor => flavor.trim())
            .filter((flavor) => flavor.length > 0);
        setProduct(prev => ({ ...prev, flavors: parsedFlavors }));
    };

    const submit = async () => {
        if (!data) return;
        const validationErrors = ValidateProductForm(product);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            if (isUpdate) {
                await UpdateProduct(product, data);
                notifySuccess(`Produto ${product.name} atualizado com sucesso`);
            } else {
                await NewProduct(product, data);
                notifySuccess(`Produto ${product.name} criado com sucesso`);
            }

            queryClient.invalidateQueries({ queryKey: ['products'] });
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
            queryClient.invalidateQueries({ queryKey: ['products'] });
            modalHandler.hideModal(modalName);
            notifySuccess(`Produto ${product.name} removido com sucesso`);
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Erro ao remover produto');
        }
    }

    return (
        <div className="text-black space-y-6">
            {/* Seção: Informações Básicas */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações Básicas</h3>
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField friendlyName='Código de busca' name='code' setValue={value => handleInputChange('code', value)} value={product.code} />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField friendlyName='Nome' name='name' setValue={value => handleInputChange('name', value)} value={product.name} />
                        </div>
                    </div>
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TextField friendlyName='Descrição' name='description' setValue={value => handleInputChange('description', value)} value={product.description} optional />
                    </div>
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TextField
                            friendlyName='Sabores (separados por vírgula)'
                            name='flavors'
                            placeholder='Ex.: Calabresa, 4 queijos, Pepperoni'
                            setValue={(value) => handleFlavorsChange(value)}
                            value={flavorsInput}
                            optional
                        />
                        <p className="text-xs text-gray-500 mt-1">Digite os sabores e separe cada um com vírgula.</p>
                    </div>
                </div>
            </div>

            {/* Seção: Preços e Custos */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">Preços e Custos</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                        <PriceField friendlyName='Preço' name='price' setValue={value => handleInputChange('price', value)} value={product.price} />
                    </div>
                    <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                        <PriceField friendlyName='Custo' name='cost' setValue={value => handleInputChange('cost', value)} value={product.cost} optional />
                    </div>
                </div>
            </div>

            {/* Seção: Imagem e Disponibilidade */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-blue-200">Imagem e Disponibilidade</h3>
                <div className="space-y-4">
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <ImageField
                            friendlyName='Imagem'
                            name='image_path'
                            setValue={value => handleInputChange('image_path', value)}
                            value={product.image_path}
                            optional
                            onUploadError={(error) => notifyError(error)}
                        />
                    </div>
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <CheckboxField friendlyName='Disponível' name='is_available' setValue={value => handleInputChange('is_available', value)} value={product.is_available} />
                    </div>
                    {isUpdate && (
                        <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                            <CheckboxField friendlyName='Ativo' name='is_active' setValue={value => handleInputChange('is_active', value)} value={product.is_active} />
                        </div>
                    )}
                </div>
            </div>

            {/* Seção: Categoria e Tamanho */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg shadow-sm border border-purple-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">Categoria e Tamanho</h3>
                <div className="space-y-4">
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <RadioField friendlyName='Categorias' name='category_id' setSelectedValue={value => handleInputChange('category_id', value)} selectedValue={product.category_id} values={categories} />
                    </div>
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <RadioField friendlyName='Tamanhos' name='size_id' setSelectedValue={value => handleInputChange('size_id', value)} selectedValue={product.size_id} values={sizes} />
                    </div>
                </div>
            </div>

            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={product.id} />

            <ErrorForms errors={errors} setErrors={setErrors} />
            <ButtonsModal item={product} name='produto' onSubmit={submit} />
        </div>
    );
};

export default ProductForm;
