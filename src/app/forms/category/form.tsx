'use client';

import React, { useEffect, useState } from 'react';
import { TextField, HiddenField, CheckboxField } from '../../components/modal/field';
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
import RemovableItensComponent from './removable-ingredients';
import AdditionalCategorySelector from './additional-category';
import ComplementCategorySelector from './complement-category';
import { useRouter } from 'next/navigation';
import { addCategory, fetchCategories, removeCategory, updateCategory } from '@/redux/slices/categories';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';

interface CategoryFormProps extends CreateFormsProps<Category> {
    setItem?: (item: Category) => void
}
const CategoryForm = ({ item, setItem, isUpdate }: CategoryFormProps) => {
    const modalName = isUpdate ? 'edit-category-' + item?.id : 'new-category'
    const modalHandler = useModal();
    const [category, setCategory] = useState<Category>(item || new Category());
    const [selectedType, setSelectedType] = useState<TypeCategory>("Normal");
    const { data } = useSession();
    const [error, setError] = useState<RequestError | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    useEffect(() => {
        if (item?.is_additional) setSelectedType("Adicional");
        if (item?.is_complement) setSelectedType("Complemento");
        if (!item?.is_additional && !item?.is_complement) setSelectedType("Normal");
    }, [item])

    useEffect(() => {
        const setType: Record<TypeCategory, () => void> = {
            "Normal": () => setCategory(prev => ({ ...prev, is_complement: false, is_additional: false })),
            "Complemento": () => setCategory(prev => ({ ...prev, is_complement: true, is_additional: false })),
            "Adicional": () => setCategory(prev => ({ ...prev, is_complement: false, is_additional: true }))
        }

        setType[selectedType]()
    }, [selectedType])

    useEffect(() => {
        if (data && Object.keys(categoriesSlice.entities).length === 0) {
            dispatch(fetchCategories(data));
        }

        const interval = setInterval(() => {
            if (data) {
                dispatch(fetchCategories(data));
            }
        }, 60000); // Atualiza a cada 60 segundos

        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data?.user.access_token, dispatch]);

    const handleInputChange = (field: keyof Category, value: any) => {
        setCategory(prev => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (!data) return;

        const validationErrors = ValidateCategoryForm(category);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const response = isUpdate ? await UpdateCategory(category, data) : await NewCategory(category, data)
            setError(null);

            if (!isUpdate) {
                category.id = response
                dispatch(addCategory(category));
                notifySuccess(`Categoria ${category.name} criada com sucesso`);
                modalHandler.hideModal(modalName);
            } else {
                dispatch(updateCategory({ type: "UPDATE", payload: { id: category.id, changes: category } }));
                if (setItem) setItem(category)
                notifySuccess(`Categoria ${category.name} atualizada com sucesso`);
            }

        } catch (error) {
            const err = error as RequestError;
            setError(err);
            notifyError(err.message || 'Erro ao salvar categoria');
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteCategory(category.id, data);
        dispatch(removeCategory(category.id));

        if (!isUpdate) {
            modalHandler.hideModal(modalName);
            notifySuccess(`Categoria ${category.name} removida com sucesso`);
        } else {
            router.back();
            notifySuccess(`Categoria ${category.name} removida com sucesso`);
        }
    }

    const isUpdated = JSON.stringify(category) !== JSON.stringify(item)
    const classIsUpdate = isUpdate ? "w-[80vw]" : "";

    return (
        <div className={classIsUpdate}>
            {/* Bloco de Dados Básicos */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-md font-medium mb-4">Dados Básicos</h2>

                <TextField
                    friendlyName="Nome"
                    name="name"
                    setValue={value => handleInputChange('name', value)}
                    value={category.name}
                />
                <TextField
                    friendlyName="Imagem"
                    name="image_path"
                    setValue={value => handleInputChange('image_path', value)}
                    value={category.image_path}
                    optional
                />
                <CheckboxField
                    friendlyName="Deseja imprimir no pedido?"
                    name="need_print"
                    setValue={value => handleInputChange('need_print', value)}
                    value={category.need_print}
                    optional
                />
                <CheckboxField
                    friendlyName="Deseja produzir com processos?"
                    name="use_process_rule"
                    setValue={value => handleInputChange('use_process_rule', value)}
                    value={category.use_process_rule}
                    optional
                />

                {/* Bloco de Categorias Adicionais e Complementos (Condicional) */}
                {selectedType === "Normal" && (
                    <>
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
                    </>
                )}


                {/* Bloco de Ingredientes Removíveis */}
                <hr className="my-4" />
                <RemovableItensComponent item={category} setItem={setCategory} />

                {/* Bloco de Tipo de Categoria */}
                {!isUpdate && (
                    <TypeCategorySelector selectedType={selectedType} setSelectedType={setSelectedType} />
                )}

                {/* Campo Oculto para ID */}
                <HiddenField
                    name="id"
                    setValue={value => handleInputChange('id', value)}
                    value={category.id}
                />

                {/* Exibição de Erros */}
                {error && <p className="mb-4 text-red-500 text-center">{error.message}</p>}
                <ErrorForms errors={errors} />

                <hr className="my-6" />

                {/* Botões para Atualizar ou Excluir */}
                {isUpdated ? (
                    <ButtonsModal item={category} name="quantity" onSubmit={submit} deleteItem={onDelete} />
                ) : (
                    <ButtonsModal item={category} name="quantity" deleteItem={onDelete} />
                )}
            </div>
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