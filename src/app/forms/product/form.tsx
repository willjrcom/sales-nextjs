'use client';

import { useState, useMemo, useEffect } from 'react';
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
import ProductVariation from '@/app/entities/product/variation';
import Size from '@/app/entities/size/size';
import { Trash, Plus } from 'lucide-react';
import Decimal from 'decimal.js';

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
    const filteredSizes = useMemo(() => sizes.filter(size => size.is_active), [sizes]);

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

    // Sync variations with available sizes from the category
    useEffect(() => {
        if (!filteredSizes.length) return;

        setProduct(prev => {
            // Create a map of existing variations for quick lookup
            const existingVariationsMap = new Map(
                prev.variations.map((v: ProductVariation) => [v.size_id, v])
            );

            const newVariations = filteredSizes.map((size: Size) => {
                // If variation exists for this size, keep it (preserve price, cost, etc.)
                if (existingVariationsMap.has(size.id)) {
                    const existing = existingVariationsMap.get(size.id)!;
                    // Update size object in case it changed, but keep price/cost/availability
                    return new ProductVariation({
                        ...existing,
                        size: size // Update size details
                    });
                }

                // Otherwise create new variation for this size
                return new ProductVariation({
                    size_id: size.id,
                    size: size,
                    price: new Decimal(0),
                    cost: new Decimal(0),
                    is_available: true
                });
            });

            return { ...prev, variations: newVariations };
        });
    }, [filteredSizes]);

    const handleVariationChange = (index: number, field: keyof ProductVariation, value: any) => {
        setProduct(prev => {
            const newVariations = [...prev.variations];
            newVariations[index] = { ...newVariations[index], [field]: value };
            return { ...prev, variations: newVariations };
        });
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
                            <TextField friendlyName='SKU' name='sku' setValue={value => handleInputChange('sku', value)} value={product.sku} />
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

            {/* Seção: Imagem e Disponibilidade Geral */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-blue-200">Imagem e Opções</h3>
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
                    {isUpdate && (
                        <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                            <CheckboxField friendlyName='Ativo' name='is_active' setValue={value => handleInputChange('is_active', value)} value={product.is_active} />
                        </div>
                    )}
                </div>
            </div>

            {/* Seção: Categoria */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg shadow-sm border border-purple-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">Categoria</h3>
                <div className="space-y-4">
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <RadioField friendlyName='Categorias' name='category_id' setSelectedValue={value => handleInputChange('category_id', value)} selectedValue={product.category_id} values={categories} />
                    </div>
                </div>
            </div>

            {/* Seção: Variações (Tamanhos e Preços) */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-green-200">
                    <h3 className="text-lg font-semibold text-gray-800">Variações (Tamanhos e Preços)</h3>
                    {/* Botão de adicionar removido pois é automático baseado na categoria */}
                </div>

                <div className="space-y-6">
                    {product.variations.map((variation: ProductVariation, index: number) => {
                        // Encontra o tamanho correspondente para exibir o nome
                        const sizeName = variation.size?.name || filteredSizes.find((s: Size) => s.id === variation.size_id)?.name || 'Tamanho desconhecido';

                        return (
                            <div key={index} className="bg-white/50 p-4 rounded-lg border border-green-100 relative group">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho</label>
                                        <div className="w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm p-2 border text-gray-700">
                                            {sizeName}
                                        </div>
                                        <HiddenField name={`variations.${index}.size_id`} setValue={() => { }} value={variation.size_id} />
                                    </div>
                                    <div className="flex items-center mt-6">
                                        <CheckboxField
                                            friendlyName='Disponível'
                                            name={`variations.${index}.is_available`}
                                            setValue={value => handleVariationChange(index, 'is_available', value)}
                                            value={variation.is_available}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <PriceField
                                        friendlyName='Preço'
                                        name={`variations.${index}.price`}
                                        setValue={value => handleVariationChange(index, 'price', value)}
                                        value={variation.price}
                                    />
                                    <PriceField
                                        friendlyName='Custo'
                                        name={`variations.${index}.cost`}
                                        setValue={value => handleVariationChange(index, 'cost', value)}
                                        value={variation.cost}
                                        optional
                                    />
                                </div>
                            </div>
                        )
                    })}
                    {product.variations.length === 0 && (
                        <p className="text-center text-gray-500 py-4">Selecione uma categoria para ver os tamanhos disponíveis.</p>
                    )}
                </div>
            </div>

            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={product.id} />

            <ErrorForms errors={errors} setErrors={setErrors} />
            <ButtonsModal item={product} name='produto' onSubmit={submit} />
        </div>
    );
};

export default ProductForm;
