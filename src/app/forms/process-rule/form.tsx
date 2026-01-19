'use client';

import React, { useMemo, useState } from 'react';
import { TextField, NumberField, HiddenField, TimeField, SelectField, ImageField, CheckboxField } from '../../components/modal/field';
import ProcessRule, { ValidateProcessRuleForm } from '@/app/entities/process-rule/process-rule';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteProcessRule from '@/app/api/process-rule/delete/process-rule';
import NewProcessRule from '@/app/api/process-rule/new/process-rule';
import UpdateProcessRule from '@/app/api/process-rule/update/process-rule';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GetCategoriesMap } from '@/app/api/category/category';

const ProcessRuleForm = ({ item, isUpdate }: CreateFormsProps<ProcessRule>) => {
    const modalName = isUpdate ? 'edit-process-rule-' + item?.id : 'new-process-rule'
    const modalHandler = useModal();
    const [processRule, setProcessRule] = useState<ProcessRule>(item || new ProcessRule());
    const queryClient = useQueryClient();
    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories', 'map', 'process-rule'],
        queryFn: () => GetCategoriesMap(data!, true, false, false),
        enabled: !!data?.user?.access_token,
        refetchInterval: 60000,
    });

    const categories = useMemo(() => categoriesResponse || [], [categoriesResponse]);
    const category = useMemo(() => categories.find(c => c.id === processRule.category_id), [categories, processRule.category_id]);

    const handleInputChange = (field: keyof ProcessRule, value: any) => {
        setProcessRule(prev => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (!data) return;

        const validationErrors = ValidateProcessRuleForm(processRule);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const response = isUpdate ? await UpdateProcessRule(processRule, data) : await NewProcessRule(processRule, data);

            if (!isUpdate) {
                processRule.id = response
                notifySuccess(`Regra de processo ${processRule.name} criada com sucesso`);
            } else {
                notifySuccess(`Regra de processo ${processRule.name} atualizada com sucesso`);
            }

            queryClient.invalidateQueries({ queryKey: ['process-rules'] });
            modalHandler.hideModal(modalName);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao salvar regra de processo');
        }
    }

    const onDelete = async () => {
        if (!data) return;
        try {
            await DeleteProcessRule(processRule.id, data);
            notifySuccess(`Regra de processo ${processRule.name} removida com sucesso`);
            queryClient.invalidateQueries({ queryKey: ['process-rules'] });
            modalHandler.hideModal(modalName);
        } catch (error: RequestError | any) {
            notifyError(error.message || `Erro ao remover regra de processo ${processRule.name}`);
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
                            <TextField friendlyName='Nome' name='name' setValue={value => handleInputChange('name', value)} value={processRule.name} />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <NumberField friendlyName='Ordem (minimo: 1)' name='order' min={1} setValue={value => handleInputChange('order', value)} value={processRule.order} />
                        </div>
                    </div>
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TextField friendlyName='Descrição' name='description' setValue={value => handleInputChange('description', value)} value={processRule.description} optional />
                    </div>
                </div>
            </div>

            {/* Seção: Imagem e Tempo */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-blue-200">Imagem e Tempo</h3>
                <div className="space-y-4">
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <ImageField
                            friendlyName='Imagem'
                            name='image_path'
                            setValue={value => handleInputChange('image_path', value)}
                            value={processRule.image_path || ""}
                            optional
                            onUploadError={(error) => notifyError(error)}
                        />
                    </div>
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TimeField friendlyName='Tempo ideal (mm:ss)' name='ideal_time' setValue={value => handleInputChange('ideal_time', value)} value={processRule.ideal_time} />
                    </div>
                </div>
            </div>

            {/* Seção: Categoria */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg shadow-sm border border-purple-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">Categoria</h3>
                <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                    {isUpdate && <TextField friendlyName='Categoria' name='category' value={category?.name || ""} setValue={() => { }} disabled />}
                    {!isUpdate && <SelectField friendlyName='Categoria' name='category' values={categories} selectedValue={processRule.category_id} setSelectedValue={value => handleInputChange('category_id', value)} />}
                </div>
            </div>

            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={processRule.id} />

            <ErrorForms errors={errors} setErrors={setErrors} />

            {/* Seção: Status */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">Status</h3>
                <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                    <CheckboxField
                        friendlyName="Ativo"
                        name="is_active"
                        setValue={value => handleInputChange('is_active', value)}
                        value={processRule.is_active}
                    />
                </div>
            </div>

            <ButtonsModal item={processRule} name="Regras de processos" onSubmit={submit} />
        </div>
    );
};

export default ProcessRuleForm;
