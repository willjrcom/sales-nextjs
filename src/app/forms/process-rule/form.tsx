'use client';

import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, NumberField, HiddenField, PatternField, SelectField, ImageField, CheckboxField } from '../../components/modal/field';
import ProcessRule, { SchemaProcessRule } from '@/app/entities/process-rule/process-rule';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteProcessRule from '@/app/api/process-rule/delete/process-rule';
import NewProcessRule from '@/app/api/process-rule/new/process-rule';
import { GetProcessRulesByCategoryID } from '@/app/api/process-rule/process-rule';
import UpdateProcessRule from '@/app/api/process-rule/update/process-rule';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GetCategoriesMap } from '@/app/api/category/category';
import Category from '@/app/entities/category/category';

interface ProcessRuleFormProps extends CreateFormsProps<ProcessRule> {
    category: Category;
}

const ProcessRuleForm = ({ item, isUpdate, category, onSuccess }: ProcessRuleFormProps) => {
    const modalName = isUpdate ? 'edit-process-rule-' + item?.id : 'new-process-rule'
    const modalHandler = useModal();
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const [isSaving, setIsSaving] = useState(false);

    const initialValues = useMemo(() => {
        const prod = new ProcessRule(item);
        return {
            id: prod.id,
            name: prod.name,
            order: prod.order,
            description: prod.description || '',
            image_path: prod.image_path || '',
            ideal_time: prod.ideal_time || '00:00',
            category_id: category.id,
            is_active: prod.is_active,
        }
    }, [item]);

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<any>({
        resolver: zodResolver(SchemaProcessRule),
        defaultValues: initialValues
    });

    const processRule = watch();

    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories', 'map', 'process-rule'],
        queryFn: () => GetCategoriesMap(session as any, true, false, false),
        enabled: !!(session as any)?.user?.access_token,
        refetchInterval: 60000,
    });

    const categories = useMemo(() => categoriesResponse || [], [categoriesResponse]);
    const { data: processRulesByCategory } = useQuery({
        queryKey: ['process-rules', 'by-category', category.id],
        queryFn: () => GetProcessRulesByCategoryID(session as any, category.id),
        enabled: !!(session as any)?.user?.access_token && !!category.id,
    });

    const isOrderDuplicate = useMemo(() => {
        if (!processRulesByCategory) return false;
        return processRulesByCategory.some(rule => rule.order === processRule.order && rule.id !== processRule.id);
    }, [processRulesByCategory, processRule.order, processRule.id]);

    const onInvalid = () => {
        notifyError('Verifique os campos obrigatórios');
    };

    const submit = async (formData: any) => {
        if (!session) return;

        setIsSaving(true);
        try {
            const processRuleToSave = new ProcessRule(formData);
            const response = isUpdate ? await UpdateProcessRule(processRuleToSave, session) : await NewProcessRule(processRuleToSave, session);

            if (!isUpdate) {
                processRuleToSave.id = response
                notifySuccess(`Regra de processo ${processRuleToSave.name} criada com sucesso`);
            } else {
                notifySuccess(`Regra de processo ${processRuleToSave.name} atualizada com sucesso`);
            }

            queryClient.invalidateQueries({ queryKey: ['process-rules'] });
            modalHandler.hideModal(modalName);
            if (onSuccess) onSuccess();
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao salvar regra de processo');
        } finally {
            setIsSaving(false);
        }
    }

    const onDelete = async () => {
        if (!session || !processRule.id) return;
        setIsSaving(true);
        try {
            await DeleteProcessRule(processRule.id, session);
            notifySuccess(`Regra de processo ${processRule.name} removida com sucesso`);
            queryClient.invalidateQueries({ queryKey: ['process-rules'] });
            modalHandler.hideModal(modalName);
            if (onSuccess) onSuccess();
        } catch (error: RequestError | any) {
            notifyError(error.message || `Erro ao remover regra de processo ${processRule.name}`);
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
                            <TextField friendlyName='Nome' name='name' setValue={(value: any) => setValue('name', value)} value={processRule.name} error={errors.name?.message as string} />
                        </div>
                    </div>
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TextField friendlyName='Descrição' name='description' setValue={(value: any) => setValue('description', value)} value={processRule.description} optional error={errors.description?.message as string} />
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
                            setValue={(value: any) => setValue('image_path', value)}
                            value={processRule.image_path || ""}
                            optional
                            onUploadError={(error: string) => notifyError(error)}
                        />
                    </div>
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <PatternField friendlyName='Tempo ideal (mm:ss)' name='ideal_time' patternName='duration' formatted={true} setValue={(value: any) => setValue('ideal_time', value)} value={processRule.ideal_time} error={errors.ideal_time?.message as string} />
                    </div>
                </div>
            </div>

            {/* Seção: Status */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">Status</h3>
                <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                    <CheckboxField
                        friendlyName="Ativo"
                        name="is_active"
                        setValue={(value: any) => setValue('is_active', value)}
                        value={processRule.is_active}
                        error={errors.is_active?.message as string}
                    />
                </div>
            </div>

            <ButtonsModal item={processRule} name="Regras de processos" onSubmit={handleSubmit(submit, onInvalid)} deleteItem={onDelete} isPending={isSaving} />
        </div>
    );
};

export default ProcessRuleForm;
