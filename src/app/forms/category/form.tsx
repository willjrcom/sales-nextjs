import React, { useEffect, useMemo, useState } from 'react';
import { TextField, CheckboxField, SelectField, HiddenField, ImageField } from '../../components/modal/field';
import Category, { SchemaCategory, SplitPricingStrategy } from '@/app/entities/category/category';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteCategory from '@/app/api/category/delete/category';
import NewCategory from '@/app/api/category/new/category';
import UpdateCategory from '@/app/api/category/update/category';
import { useModal } from '@/app/context/modal/context';
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ListProcessRule from './list-process-rule';
import Image from 'next/image';

const splitPricingOptionsList = [
    { id: 'highest_item', name: 'Cobrar o sabor mais caro' },
    { id: 'average', name: 'Cobrar a média dos preços' },
    { id: 'sum', name: 'Somar todos os sabores' },
] as const;

const splitPricingMessages: Record<SplitPricingStrategy, string> = {
    highest_item: '✓ Cobra o valor do item mais caro da combinação. Ideal para pizzas meio a meio, cobrando sempre o sabor premium.',
    average: '✓ Faz a média dos valores (ex.: (40 + 50) / 2 = 45). Ótimo para dividir o custo de sabores parecidos.',
    sum: '⚠️ Soma integralmente todos os sabores (ex.: 40 + 50 = 90). Use quando cada metade deve ser cobrada por completo.',
};

const CategoryForm = ({ item, isUpdate }: CreateFormsProps<Category>) => {
    const modalName = isUpdate ? 'edit-category-' + item?.id : 'new-category'
    const modalHandler = useModal();
    const { data } = useSession();
    const queryClient = useQueryClient();
    const router = useRouter();

    const {
        handleSubmit,
        setValue,
        watch,
        control,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<Category>({
        resolver: zodResolver(SchemaCategory) as any,
        defaultValues: new Category(item)
    });

    const category = watch();
    const [selectedType, setSelectedType] = useState<"Normal" | "Adicional" | "Complemento">("Normal");

    const { data: printersResponse } = useQuery({
        queryKey: ['printers'],
        queryFn: () => printService.getPrinters(),
        enabled: !!(data as any)?.user?.access_token && category.need_print,
        refetchInterval: 30000,
    })

    const printers = useMemo(() => printersResponse?.map((p: any) => ({ id: p.name, name: p.name })) || [], [printersResponse])

    const splitPricingOptions = useMemo(() => splitPricingOptionsList, []);
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
        mutationFn: (updatedCategory: Category) => UpdateCategory(updatedCategory, data!),
        onSuccess: (_, updatedCategory) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            notifySuccess(`Categoria ${updatedCategory.name} atualizada com sucesso`);
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao atualizar categoria');
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
        else if (item?.is_complement) setSelectedType("Complemento");
        else setSelectedType("Normal");
    }, [item])

    useEffect(() => {
        if (selectedType === "Normal") {
            setValue('is_complement', false);
            setValue('is_additional', false);
        } else if (selectedType === "Complemento") {
            setValue('is_complement', true);
            setValue('is_additional', false);
        } else if (selectedType === "Adicional") {
            setValue('is_complement', false);
            setValue('is_additional', true);
        }

        if (selectedType === "Adicional" || selectedType === "Complemento") {
            setValue('use_process_rule', false);
            setValue('need_print', false);
        }
    }, [selectedType, setValue])

    const onSubmit = async (formData: any) => {
        if (!data) return;
        const categoryToSave = new Category(formData);

        if (isUpdate) {
            updateMutation.mutate(categoryToSave)
        } else {
            createMutation.mutate(categoryToSave)
        }
    }

    const onInvalid = () => {
        console.log(errors);
        notifyError('Formulário inválido. Verifique os campos.');
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
                        setValue={(value: any) => setValue('name', value)}
                        value={category.name}
                        error={errors.name?.message}
                    />
                    <ImageField
                        friendlyName="Imagem"
                        name="image_path"
                        setValue={(value: any) => setValue('image_path', value)}
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
                            <CheckboxField
                                friendlyName='Ativo'
                                name='is_active'
                                setValue={(value: any) => setValue('is_active', value)}
                                value={category.is_active}
                            />
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

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full">Gerenciar Regras de Processo</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Gerenciar Regras de Processos da Categoria {category.name}</DialogTitle>
                                </DialogHeader>
                                <ListProcessRule category={category} />
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
                                    setValue={(value: any) => setValue('need_print', value)}
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
                                        setSelectedValue={(value: any) => setValue('printer_name', value)}
                                        optional
                                    />
                                </div>
                            )}

                            <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                                <CheckboxField
                                    friendlyName="Permitir fracionado?"
                                    name="allow_fractional"
                                    setValue={(value: any) => setValue('allow_fractional', value)}
                                    value={category.allow_fractional}
                                    optional
                                />
                            </div>

                            <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                                <SelectField
                                    friendlyName="Regra de precificação do fracionado"
                                    name="split_pricing_strategy"
                                    values={splitPricingOptions}
                                    selectedValue={category.split_pricing_strategy || 'highest_item'}
                                    setSelectedValue={(value: string) => setValue('split_pricing_strategy', (value || 'highest_item') as SplitPricingStrategy)}
                                    disabled={!category.allow_fractional}
                                    removeDefaultOption
                                    optional={!category.allow_fractional}
                                />
                                <p className="text-xs mt-1 text-muted-foreground">
                                    {category.allow_fractional
                                        ? splitPricingMessages[(category.split_pricing_strategy || 'highest_item') as SplitPricingStrategy]
                                        : '⚠️ Ative "Permitir fracionado" para escolher como o preço das combinações será calculado.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Seção: Categorias Adicionais */}
                    <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                        <div className="mb-3">
                            <h4 className="text-sm font-semibold text-green-900">Categorias adicionais</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                Use para vincular sabores que serão somados como adicionais, como “Mussarela” ou “Bacon”.
                                Exemplos práticos: meio a meio com Mussarela + Bacon, ou toppings vendidos à parte.
                                Eles aparecem como extras quando o operador monta o pedido.
                            </p>
                        </div>
                        <div className="mb-4">
                            <div
                                className="relative inline-flex flex-col gap-1 rounded-xl border border-green-200 bg-white/80 px-4 py-3 shadow hover:shadow-lg transition-all duration-200 group focus-within:ring-2 focus-within:ring-green-300"
                                tabIndex={0}
                                aria-label="Exemplo visual de adicionais"
                            >
                                <p className="text-sm font-semibold text-green-900">Veja um exemplo visual</p>
                                <span className="text-xs text-muted-foreground">Passe o mouse ou toque para visualizar</span>
                                <div className="absolute left-1/2 top-full mt-3 w-[420px] -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 z-30 sm:left-full sm:top-1/2 sm:ml-6 sm:-translate-x-0 sm:-translate-y-1/2">
                                    <Image
                                        src="/item-example.png"
                                        alt="Exemplo de item com adicionais destacados"
                                        width={640}
                                        height={400}
                                        className="rounded-2xl border border-green-100 shadow-2xl w-full h-auto max-h-[360px] object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                        <AdditionalCategorySelector
                            value={category.additional_categories}
                            onChange={(value) => setValue('additional_categories', value)}
                        />
                    </div>

                    {/* Seção: Complementos */}
                    <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg shadow-sm border border-purple-100 p-6 transition-all duration-300 hover:shadow-md">
                        <div className="mb-3">
                            <h4 className="text-sm font-semibold text-purple-900">Categorias de complemento</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                Perfeito para itens que acompanham o produto principal, como “Borda recheada” para pizzas,
                                “Batata frita” como acompanhamento ou “Combos” completos.
                                Deixe claro ao operador que esses complementos não alteram o sabor principal, mas agregam valor.
                            </p>
                        </div>
                        <ComplementCategorySelector
                            value={category.complement_categories}
                            onChange={(value) => setValue('complement_categories', value)}
                        />
                    </div>

                    {/* Seção: Ingredientes Removíveis */}
                    <div className="bg-gradient-to-br from-white to-orange-50 rounded-lg shadow-sm border border-orange-100 p-6 transition-all duration-300 hover:shadow-md">
                        <RemovableItensComponent
                            value={category.removable_ingredients}
                            onChange={(value) => setValue('removable_ingredients', value)}
                        />
                    </div>
                </>
            )}

            {/* Campo Oculto para ID */}
            <HiddenField
                name="id"
                setValue={(value: any) => setValue('id', value)}
                value={category.id}
            />

            {/* Botões para Atualizar ou Excluir */}
            {isUpdated ? (
                <ButtonsModal
                    item={category}
                    name="category"
                    onSubmit={handleSubmit(onSubmit, onInvalid)}
                    deleteItem={onDelete}
                    isPending={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || isSubmitting}
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
