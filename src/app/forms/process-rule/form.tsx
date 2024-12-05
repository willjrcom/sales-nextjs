'use client';

import React, { useEffect, useState } from 'react';
import { TextField, NumberField, HiddenField, TimeField } from '../../components/modal/field';
import ProcessRule, { ValidateProcessRuleForm } from '@/app/entities/process-rule/process-rule';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteProcessRule from '@/app/api/process-rule/delete/route';
import { useProcessRules } from '@/app/context/process-rule/context';
import NewProcessRule from '@/app/api/process-rule/new/route';
import UpdateProcessRule from '@/app/api/process-rule/update/route';
import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/api/error';
import { useCategories } from '@/app/context/category/context';
import Category from '@/app/entities/category/category';

const ProcessRuleForm = ({ item, isUpdate }: CreateFormsProps<ProcessRule>) => {
    const modalName = isUpdate ? 'edit-process-rule-' + item?.id : 'new-process-rule'
    const modalHandler = useModal();
    const [processRule, setProcessRule] = useState<ProcessRule>(item || new ProcessRule());
    const [category, setCategory] = useState<Category>(new Category());
    const contextCategories = useCategories();
    const context = useProcessRules()

    const { data } = useSession();
    const [error, setError] = useState<RequestError | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    useEffect(() => {
        const category = contextCategories.findByID(processRule.category_id);
        if (!category) return
        setCategory(category)
    }, [item?.id])

    const handleInputChange = (field: keyof ProcessRule, value: any) => {
        setProcessRule(prev => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (!data) return;

        const validationErrors = ValidateProcessRuleForm(processRule);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const response = isUpdate ? await UpdateProcessRule(processRule, data) : await NewProcessRule(processRule, data);
            setError(null);

            if (!isUpdate) {
                processRule.id = response
                context.addItem(processRule);
            } else {
                context.updateItem(processRule);
            }

            modalHandler.hideModal(modalName);

        } catch (error) {
            setError(error as RequestError);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteProcessRule(processRule.id, data);
        context.removeItem(processRule.id)
        modalHandler.hideModal(modalName);
    }

    return (
        <>
            <TextField friendlyName='Nome' name='name' setValue={value => handleInputChange('name', value)} value={processRule.name} />
            <TextField friendlyName='Descrição' name='description' setValue={value => handleInputChange('description', value)} value={processRule.description} />
            <NumberField friendlyName='Ordem' name='order' setValue={value => handleInputChange('order', value)} value={processRule.order} />
            <TextField friendlyName='Caminho da imagem' name='image_path' setValue={value => handleInputChange('image_path', value)} value={processRule.image_path || ""} />
            <div className='flex justify-around'>
                <TimeField friendlyName='Tempo ideal (mm:ss)' name='ideal_time' setValue={value => handleInputChange('ideal_time', value)} value={processRule.ideal_time} />
                <TimeField friendlyName='Tempo experimental (mm:ss)' name='experimental_error' setValue={value => handleInputChange('experimental_error', value)} value={processRule.experimental_error} />
            </div>
            <TextField friendlyName='Categoria' name='category' value={category.name} setValue={() => {}} disabled />
            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={processRule.id} />

            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <ErrorForms errors={errors} />
            <ButtonsModal item={processRule} name="Regras de processos" onSubmit={submit} deleteItem={onDelete} />
        </>
    );
};

export default ProcessRuleForm;
