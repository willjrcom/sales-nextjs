'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { TextField, CheckboxField, SelectField, HiddenField, ImageField } from '../../components/modal/field';
import Category, { ValidateCategoryForm } from '@/app/entities/category/category';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteCategory from '@/app/api/category/delete/category';
import NewCategory from '@/app/api/category/new/category';
import UpdateCategory from '@/app/api/category/update/category';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import AdditionalCategorySelector from './additional-category';
import ComplementCategorySelector from './complement-category';
import RemovableItensComponent from './removable-ingredients';
import { useRouter } from 'next/navigation';
import printService from '@/app/utils/print-service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ListSize from './list-size';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const CategoryForm = ({ item, isUpdate }: CreateFormsProps<Category>) => {
    const modalName = isUpdate ? 'edit-category-' + item?.id : 'new-category'
    const modalHandler = useModal();
    const [category, setCategory] = useState<Category>(new Category(item));
    const [selectedType, setSelectedType] = useState<"Normal" | "Adicional" | "Complemento">("Normal");
    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: printersResponse } = useQuery({
        queryKey: ['printers'],
        queryFn: () => printService.getPrinters(),
        enabled: !!data?.user?.access_token && category.need_print,
        refetchInterval: 30000,
    })

    const printers = useMemo(() => printersResponse?.map((p: any) => ({ id: p.name, name: p.name })) || [], [printersResponse])

    const createMutation = useMutation({
        mutationFn: (newCategory: Category) => NewCategory(newCategory, data!),
        onSuccess: (response, newCategory) => {
            newCategory.id = response;
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            notifySuccess(`Categoria ${newCategory.name} criada com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao criar categoria');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (updatedClient: Category) => UpdateCategory(updatedClient, data!),
        onSuccess: (_, updatedClient) => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            notifySuccess(`Cliente ${updatedClient.name} atualizado com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao atualizar cliente');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (categoryId: string) => DeleteCategory(categoryId, data!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            notifySuccess(`Categoria ${category.name} removida com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || `Erro ao remover categoria ${category.name}`);
        }
    });

    useEffect(() => {
        if (item?.is_additional) setSelectedType("Adicional");
        if (item?.is_complement) setSelectedType("Complemento");
        if (!item?.is_additional && !item?.is_complement) setSelectedType("Normal");
    }, [item])

    useEffect(() => {
        const setType: Record<"Normal" | "Adicional" | "Complemento", () => void> = {
            "Normal": () => setCategory(prev => ({ ...prev, is_complement: false, is_additional: false })),
            "Complemento": () => setCategory(prev => ({ ...prev, is_complement: true, is_additional: false })),
            "Adicional": () => setCategory(prev => ({ ...prev, is_complement: false, is_additional: true }))
        }

        setType[selectedType]()

        if (selectedType === "Adicional" || selectedType === "Complemento") {
            handleInputChange('use_process_rule', false);
            handleInputChange('need_print', false);
        }
    }, [selectedType])

    const handleInputChange = (field: keyof Category, value: any) => {
        setCategory(prev => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (!data) return;

        const validationErrors = ValidateCategoryForm(category);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        if (isUpdate) {
            updateMutation.mutate(category)
        } else {
            createMutation.mutate(category)
        }
    }

    const onDelete = async () => {
        if (!data || !category.id) return;
        deleteMutation.mutate(category.id);
    }

    const isUpdated = JSON.stringify(category) !== JSON.stringify(item)

    return (
        <div className="text-black space-y-6">
            {/* Seção: Dados Básicos */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Dados Básicos</h3>
                <div className="space-y-4">
                    <TextField
                        friendlyName="Nome"
                        name="name"
                        setValue={value => handleInputChange('name', value)}
                        value={category.name}
                    />
                    <ImageField
                        friendlyName="Imagem"
                        name="image_path"
                        setValue={value => handleInputChange('image_path', value)}
                        value={category.image_path}
                        optional
                        onUploadError={(error) => notifyError(error)}
                    />

                    {/* Bloco de Tipo de Categoria */}
                    {!isUpdate && (
                        <TypeCategorySelector selectedType={selectedType} setSelectedType={setSelectedType} />
                    )}

                    {/* Mostrar tipo de Categoria */}
                    {isUpdate && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">Tipo:</span>
                            {category.is_complement ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                    Complemento
                                </span>
                            ) : category.is_additional ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                    Adicional
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                    Normal
                                </span>
                            )}
                        </div>
                    )}
                    {isUpdate && (
                        <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                            <CheckboxField friendlyName='Ativo' name='is_active' setValue={value => handleInputChange('is_active', value)} value={category.is_active} />
                        </div>
                    )}
                    {category?.id && <>
                        <hr className="my-4" />
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full">Gerenciar Tamanhos</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Gerenciar Tamanhos da Categoria {category.name}</DialogTitle>
                                </DialogHeader>
                                <ListSize categoryID={category.id} isAdditional={category.is_additional} />
                            </DialogContent>
                        </Dialog>
                    </>}
                </div>
            </div>

            {selectedType === "Normal" && (
                <>
                    {/* Seção: Configurações de Impressão */}
                    <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 transition-all duration-300 hover:shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-blue-200">Configurações de Impressão</h3>
                        <div className="space-y-4">
                            <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                                <CheckboxField
                                    friendlyName="Deseja imprimir ao lançar o pedido?"
                                    name="need_print"
                                    setValue={value => handleInputChange('need_print', value)}
                                    value={category.need_print}
                                    optional
                                />
                            </div>
                            {category.need_print && (
                                <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                                    <SelectField
                                        friendlyName="Impressora"
                                        name="printer_name"
                                        values={printers}
                                        selectedValue={category.printer_name}
                                        setSelectedValue={(value) => handleInputChange('printer_name', value)}
                                        optional
                                    />
                                </div>
                            )}
                            <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                                <CheckboxField
                                    friendlyName="Deseja produzir com processos?"
                                    name="use_process_rule"
                                    setValue={value => handleInputChange('use_process_rule', value)}
                                    value={category.use_process_rule}
                                    optional
                                />
                            </div>
                        </div>
                    </div>

                    {/* Seção: Categorias Adicionais */}
                    <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                        <AdditionalCategorySelector
                            selectedCategory={category}
                            setSelectedCategory={setCategory}
                        />
                    </div>

                    {/* Seção: Complementos */}
                    <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg shadow-sm border border-purple-100 p-6 transition-all duration-300 hover:shadow-md">
                        <ComplementCategorySelector
                            selectedCategory={category}
                            setSelectedCategory={setCategory}
                        />
                    </div>

                    {/* Seção: Ingredientes Removíveis */}
                    <div className="bg-gradient-to-br from-white to-orange-50 rounded-lg shadow-sm border border-orange-100 p-6 transition-all duration-300 hover:shadow-md">
                        <RemovableItensComponent item={category} setItem={setCategory} />
                    </div>
                </>
            )}

            {/* Campo Oculto para ID */}
            <HiddenField
                name="id"
                setValue={value => handleInputChange('id', value)}
                value={category.id}
            />

            {/* Exibição de Erros */}
            <ErrorForms errors={errors} setErrors={setErrors} />

            {/* Botões para Atualizar ou Excluir */}
            {isUpdated ? (
                <ButtonsModal
                    item={category}
                    name="category"
                    onSubmit={submit}
                    deleteItem={onDelete}
                    isPending={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
                />
            ) : (
                <ButtonsModal
                    item={category}
                    name="category"
                    deleteItem={onDelete}
                    isPending={deleteMutation.isPending}
                />
            )}
        </div>
    );
};

type TypeCategory = "Normal" | "Adicional" | "Complemento";

interface TypeCategorySelectorProps {
    selectedType: TypeCategory;
    setSelectedType: (type: TypeCategory) => void
}

const TypeCategorySelector = ({ selectedType, setSelectedType }: TypeCategorySelectorProps) => {
    const types: TypeCategory[] = ["Normal", "Adicional", "Complemento"];

    useEffect(() => {
        types.forEach((type) => {
            if (type === "Normal") setSelectedType(type);
        })
    }, [])

    return (
        <div className="mb-4">
            <div className="flex flex-col mt-2 space-y-2">
                <label className="block text-gray-700 text-sm font-bold">
                    Selecione o tipo de categoria:
                </label>

                <div className="flex space-x-2">
                    {types.map((type) => (
                        <button
                            key={type}
                            className={`p-3 h-10 ${selectedType === type
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-black"
                                } rounded-lg flex items-center justify-center hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`}
                            onClick={() => setSelectedType(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryForm;
export { TypeCategorySelector }