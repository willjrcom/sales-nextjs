'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, CheckboxField, RadioField, ImageField, SelectField } from '../../components/modal/field';
import Product, { SchemaProduct, ProductFormData } from '@/app/entities/product/product';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteProduct from '@/app/api/product/delete/product';
import UpdateProduct from '@/app/api/product/update/product';
import NewProduct from '@/app/api/product/new/product';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import PriceField from '@/app/components/modal/fields/price';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GetCategoriesMap } from '@/app/api/category/category';
import GetSizesByCategoryID from '@/app/api/size/size';
import ProductVariation from '@/app/entities/product/variation';
import Size from '@/app/entities/size/size';
import Decimal from 'decimal.js';

const ProductForm = ({ item, isUpdate }: CreateFormsProps<Product>) => {
    const modalName = isUpdate ? 'edit-product-' + item?.id : 'new-product'
    const modalHandler = useModal();
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const [isSaving, setIsSaving] = useState(false);

    const initialValues = useMemo(() => {
        const prod = new Product(item);
        return {
            id: prod.id,
            sku: prod.sku,
            name: prod.name,
            description: prod.description || '',
            image_path: prod.image_path || '',
            category_id: prod.category_id,
            flavors: prod.flavors || [],
            is_active: prod.is_active,
            variations: prod.variations.map(v => ({
                size_id: v.size_id,
                price: new Decimal(v.price || 0).toNumber(),
                cost: new Decimal(v.cost || 0).toNumber(),
                is_available: v.is_available ?? true
            }))
        }
    }, [item]);

    const {
        handleSubmit,
        setValue,
        watch,
        control,
        formState: { errors }
    } = useForm<any>({
        resolver: zodResolver(SchemaProduct),
        defaultValues: initialValues
    });

    const { fields, replace } = useFieldArray({
        control,
        name: "variations"
    });

    const product = watch();
    const [flavorsInput, setFlavorsInput] = useState<string>(item?.flavors?.join(', ') || '');

    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories', 'map', 'product'],
        queryFn: () => GetCategoriesMap(session as any, true),
        enabled: !!(session as any)?.user?.access_token,
        refetchInterval: 60000,
    });

    const { data: sizesResponse } = useQuery({
        queryKey: ['sizes', product.category_id],
        queryFn: () => GetSizesByCategoryID(session as any, product.category_id),
        enabled: !!(session as any)?.user?.access_token && !!product.category_id,
        refetchInterval: 60000,
    });

    const categories = useMemo(() => categoriesResponse || [], [categoriesResponse]);
    const sizes = useMemo(() => sizesResponse || [], [sizesResponse]);
    const filteredSizes = useMemo(() => sizes.filter(size => size.is_active), [sizes]);

    const handleFlavorsChange = (value: string) => {
        setFlavorsInput(value);
        const parsedFlavors = value.split(',')
            .map(flavor => flavor.trim())
            .filter((flavor) => flavor.length > 0);
        setValue('flavors', parsedFlavors);
    };

    // Sync variations with available sizes from the category
    useEffect(() => {
        if (!filteredSizes.length) return;

        // Create a map of existing variations for quick lookup
        const existingVariationsMap = new Map(
            (product.variations || []).map((v: any) => [v.size_id, v])
        );

        const newVariations = filteredSizes.map((size: Size) => {
            // If variation exists for this size, keep it (preserve price, cost, etc.)
            if (existingVariationsMap.has(size.id)) {
                const existing = existingVariationsMap.get(size.id)!;
                return {
                    ...existing,
                    size_id: size.id,
                };
            }

            // Otherwise create new variation for this size
            return {
                size_id: size.id,
                price: 0,
                cost: 0,
                is_available: true
            };
        });

        // Só faz o replace se as variações realmente mudaram ou se é a primeira vez
        const variationsChanged = JSON.stringify(newVariations.map(v => v.size_id)) !== JSON.stringify((product.variations || []).map((v: any) => v.size_id));
        if (variationsChanged) {
            replace(newVariations);
        }
    }, [filteredSizes, replace]);

    const onInvalid = () => {
        console.log(errors);
        notifyError('Verifique os campos obrigatórios');
    };

    const submit = async (formData: any) => {
        if (!session) return;
        setIsSaving(true);
        try {
            const productToSave = new Product({
                ...formData,
                variations: formData.variations.map((v: any) => new ProductVariation(v))
            });

            if (isUpdate) {
                await UpdateProduct(productToSave, session);
                notifySuccess(`Produto ${productToSave.name} atualizado com sucesso`);
            } else {
                await NewProduct(productToSave, session);
                notifySuccess(`Produto ${productToSave.name} criado com sucesso`);
            }

            queryClient.invalidateQueries({ queryKey: ['products'] });
            modalHandler.hideModal(modalName);

        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao salvar produto');
        } finally {
            setIsSaving(false);
        }
    }

    const onDelete = async () => {
        if (!session || !product.id) return;

        setIsSaving(true);
        try {
            await DeleteProduct(product.id, session);
            queryClient.invalidateQueries({ queryKey: ['products'] });
            modalHandler.hideModal(modalName);
            notifySuccess(`Produto ${product.name} removido com sucesso`);
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Erro ao remover produto');
        } finally {
            setIsSaving(false);
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
                            <TextField friendlyName='SKU' name='sku' setValue={(value: any) => setValue('sku', value)} value={product.sku} error={errors.sku?.message as string} />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField friendlyName='Nome' name='name' setValue={(value: any) => setValue('name', value)} value={product.name} error={errors.name?.message as string} />
                        </div>
                    </div>
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TextField friendlyName='Descrição' name='description' setValue={(value: any) => setValue('description', value)} value={product.description} optional error={errors.description?.message as string} />
                    </div>
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TextField
                            friendlyName='Sabores (separados por vírgula)'
                            name='flavors'
                            placeholder='Ex.: Calabresa, 4 queijos, Pepperoni'
                            setValue={(value: string) => handleFlavorsChange(value)}
                            value={flavorsInput}
                            optional
                            error={errors.flavors?.message as string}
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
                            setValue={(value: string) => setValue('image_path', value)}
                            value={product.image_path}
                            optional
                            onUploadError={(error: string) => notifyError(error)}
                        />
                    </div>
                    {isUpdate && (
                        <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                            <CheckboxField friendlyName='Ativo' name='is_active' setValue={(value: boolean) => setValue('is_active', value)} value={product.is_active} />
                        </div>
                    )}
                </div>
            </div>

            {/* Seção: Categoria */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg shadow-sm border border-purple-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">Categoria</h3>
                <div className="space-y-4">
                    {isUpdate ? (
                        <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria selecionada</label>
                            <div className="w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm p-2 border font-bold text-purple-700">
                                {categories.find(c => c.id === product.category_id)?.name || 'Categoria não encontrada'}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">A categoria não pode ser alterada após a criação do produto.</p>
                        </div>
                    ) : (
                        <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                            <SelectField friendlyName='Categorias' name='category_id' setSelectedValue={(value: any) => setValue('category_id', value)} selectedValue={product.category_id} values={categories} error={errors.category_id?.message as string} />
                        </div>
                    )}
                </div>
            </div>

            {/* Seção: Variações (Tamanhos e Preços) */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-green-200">
                    <h3 className="text-lg font-semibold text-gray-800">Variações (Tamanhos e Preços)</h3>
                </div>

                <div className="space-y-6">
                    {fields.map((field, index) => {
                        const variation = field as any;
                        const sizeName = filteredSizes.find((s: Size) => s.id === variation.size_id)?.name || 'Tamanho desconhecido';

                        return (
                            <div key={field.id} className="bg-white/50 p-4 rounded-lg border border-green-100 relative group">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho</label>
                                        <div className="w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm p-2 border text-gray-700">
                                            {sizeName}
                                        </div>
                                    </div>
                                    <div className="flex items-center mt-6">
                                        <CheckboxField
                                            friendlyName='Disponível'
                                            name={`variations.${index}.is_available`}
                                            setValue={(value: boolean) => setValue(`variations.${index}.is_available`, value)}
                                            value={product.variations?.[index]?.is_available}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <PriceField
                                        friendlyName='Preço'
                                        name={`variations.${index}.price`}
                                        setValue={(value: Decimal) => setValue(`variations.${index}.price`, value.toNumber())}
                                        value={new Decimal(product.variations?.[index]?.price || 0)}
                                        error={(errors.variations as any)?.[index]?.price?.message}
                                    />
                                    <PriceField
                                        friendlyName='Custo'
                                        name={`variations.${index}.cost`}
                                        setValue={(value: Decimal) => setValue(`variations.${index}.cost`, value.toNumber())}
                                        value={new Decimal(product.variations?.[index]?.cost || 0)}
                                        optional
                                        error={(errors.variations as any)?.[index]?.cost?.message}
                                    />
                                </div>
                            </div>
                        )
                    })}
                    {(!fields || fields.length === 0) && (
                        <p className="text-center text-gray-500 py-4">Selecione uma categoria para ver os tamanhos disponíveis.</p>
                    )}
                    {errors.variations?.message && (
                        <p className="text-center text-red-500 text-sm mt-2">{errors.variations.message as string}</p>
                    )}
                </div>
            </div>

            <ButtonsModal item={product} name='produto' onSubmit={handleSubmit(submit, onInvalid)} isPending={isSaving} deleteItem={onDelete} />
        </div>
    );
};

export default ProductForm;
