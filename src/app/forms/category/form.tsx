'use client';

import React, { useEffect, useState } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchCategories, removeCategory, updateCategory } from '@/redux/slices/categories';
import AdditionalCategorySelector from './additional-category';
import ComplementCategorySelector from './complement-category';
import RemovableItensComponent from './removable-ingredients';
import { useRouter } from 'next/navigation';

interface CategoryFormProps extends CreateFormsProps<Category> {
    setItem?: (item: Category) => void
}
const CategoryForm = ({ item, setItem, isUpdate }: CategoryFormProps) => {
    const modalName = isUpdate ? 'edit-category-' + item?.id : 'new-category'
    const modalHandler = useModal();
    const [category, setCategory] = useState<Category>(item || new Category());
    const [selectedType, setSelectedType] = useState<"Normal" | "Adicional" | "Complemento">("Normal");
    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [printers, setPrinters] = useState<{ id: string; name: string }[]>([]);
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

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

    useEffect(() => {
        if (data && Object.keys(categoriesSlice.entities).length === 0) {
            dispatch(fetchCategories({ session: data }));
        }
    }, [data?.user.access_token, dispatch]);
    useEffect(() => {
        if (category.need_print && typeof window !== 'undefined' && window.electronAPI?.getPrinters) {
            (async () => {
                try {
                    if (!window.electronAPI) return;
                    const list = await window.electronAPI.getPrinters();
                    setPrinters(list.map((p: any) => ({ id: p.name, name: p.name })));
                } catch (err) {
                    console.error('Error loading printers', err);
                }
            })();
        }
    }, [category.need_print]);

    const handleInputChange = (field: keyof Category, value: any) => {
        setCategory(prev => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (!data) return;

        const validationErrors = ValidateCategoryForm(category);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const response = isUpdate ? await UpdateCategory(category, data) : await NewCategory(category, data)

            if (!isUpdate) {
                category.id = response
                dispatch(fetchCategories({ session: data }));
                notifySuccess(`Categoria ${category.name} criada com sucesso`);
                modalHandler.hideModal(modalName);
            } else {
                dispatch(updateCategory({ type: "UPDATE", payload: { id: category.id, changes: category } }));
                if (setItem) setItem(category)
                notifySuccess(`Categoria ${category.name} atualizada com sucesso`);
            }

        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao salvar categoria');
        }
    }

    const onDelete = async () => {
        if (!data) return;

        try {
            await DeleteCategory(category.id, data);
            dispatch(removeCategory(category.id));

            if (!isUpdate) {
                modalHandler.hideModal(modalName);
                notifySuccess(`Categoria ${category.name} removida com sucesso`);
            } else {
                router.back();
                notifySuccess(`Categoria ${category.name} removida com sucesso`);
            }

        } catch (error: RequestError | any) {
            notifyError(error.message || 'Erro ao remover categoria');
        }
    }

    const isUpdated = JSON.stringify(category) !== JSON.stringify(item)

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-md font-medium mb-4">Dados Básicos</h2>

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

            {selectedType === "Normal" &&
                <>
                    <CheckboxField
                        friendlyName="Deseja imprimir ao lançar o pedido?"
                        name="need_print"
                        setValue={value => handleInputChange('need_print', value)}
                        value={category.need_print}
                        optional
                    />
                    {category.need_print && (
                        <SelectField
                            friendlyName="Impressora"
                            name="printer_name"
                            values={printers}
                            selectedValue={category.printer_name}
                            setSelectedValue={(value) => handleInputChange('printer_name', value)}
                            optional
                        />
                    )}
                    <CheckboxField
                        friendlyName="Deseja produzir com processos?"
                        name="use_process_rule"
                        setValue={value => handleInputChange('use_process_rule', value)}
                        value={category.use_process_rule}
                        optional
                    />

                    {/* Bloco de Categorias Adicionais e Complementos (Condicional) */}
                    <hr className="my-4" />
                    <AdditionalCategorySelector
                        additionalCategories={Object.values(categoriesSlice.entities)}
                        selectedCategory={category}
                        setSelectedCategory={setCategory}
                    />

                    <hr className="my-4" />
                    <ComplementCategorySelector
                        complementCategories={Object.values(categoriesSlice.entities)}
                        selectedCategory={category}
                        setSelectedCategory={setCategory}
                    />

                    {/* Bloco de Ingredientes Removíveis */}
                    <hr className="my-4" />
                    <RemovableItensComponent item={category} setItem={setCategory} />
                </>
            }

            {/* Campo Oculto para ID */}
            <HiddenField
                name="id"
                setValue={value => handleInputChange('id', value)}
                value={category.id}
            />

            {/* Exibição de Erros */}
            <ErrorForms errors={errors} setErrors={setErrors} />

            <hr className="my-6" />

            {/* Botões para Atualizar ou Excluir */}
            {isUpdated ? (
                <ButtonsModal item={category} name="quantity" onSubmit={submit} deleteItem={onDelete} />
            ) : (
                <ButtonsModal item={category} name="quantity" deleteItem={onDelete} />
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