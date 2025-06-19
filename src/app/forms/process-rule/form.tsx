'use client';

import React, { useEffect, useState } from 'react';
import { TextField, NumberField, HiddenField, TimeField, SelectField } from '../../components/modal/field';
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
import Category from '@/app/entities/category/category';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { updateCategory } from '@/redux/slices/categories';

const ProcessRuleForm = ({ item, isUpdate }: CreateFormsProps<ProcessRule>) => {
    const modalName = isUpdate ? 'edit-process-rule-' + item?.id : 'new-process-rule'
    const modalHandler = useModal();
    const [processRule, setProcessRule] = useState<ProcessRule>(item || new ProcessRule());
    const [category, setCategory] = useState<Category>(new Category());
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    useEffect(() => {
        const category = categoriesSlice.entities[processRule.category_id];
        if (!category) return
        setCategory(category)
    }, [item?.id, processRule.category_id])

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
                dispatch(updateCategory({ type: "UPDATE", payload: { id: category.id, changes: { process_rules: [...(category.process_rules ?? []), processRule] } } }));
                notifySuccess(`Regra de processo ${processRule.name} criada com sucesso`);
            } else {
                const updatedProcessRules = category.process_rules.map(rule => rule.id === processRule.id ? processRule : rule)
                dispatch(updateCategory({ type: "UPDATE", payload: { id: category.id, changes: { process_rules: updatedProcessRules ?? [] } } }));
                notifySuccess(`Regra de processo ${processRule.name} atualizada com sucesso`);
            }

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
            dispatch(updateCategory({ type: "UPDATE", payload: { id: category.id, changes: { process_rules: category.process_rules.filter(rule => rule.id !== processRule.id) ?? [] } } }));
            notifySuccess(`Regra de processo ${processRule.name} removida com sucesso`);
            modalHandler.hideModal(modalName);
        } catch (error: RequestError | any) {
            notifyError(error.message || `Erro ao remover regra de processo ${processRule.name}`);
        }
    }

    const validCategories = Object.values(categoriesSlice.entities).filter(c => !c.is_additional && !c.is_complement);

    return (
        <>
            <TextField friendlyName='Nome' name='name' setValue={value => handleInputChange('name', value)} value={processRule.name} />

            <TextField friendlyName='Descrição' name='description' setValue={value => handleInputChange('description', value)} value={processRule.description} optional />

            <NumberField friendlyName='Ordem (minimo: 1)' name='order' min={1} setValue={value => handleInputChange('order', value)} value={processRule.order} />

            <TextField friendlyName='Caminho da imagem' name='image_path' setValue={value => handleInputChange('image_path', value)} value={processRule.image_path || ""} optional />

            <TimeField friendlyName='Tempo ideal (mm:ss)' name='ideal_time' setValue={value => handleInputChange('ideal_time', value)} value={processRule.ideal_time} />

            {isUpdate && <TextField friendlyName='Categoria' name='category' value={category.name} setValue={() => { }} disabled />}
            {!isUpdate && <SelectField friendlyName='Categoria' name='category' values={validCategories} selectedValue={processRule.category_id} setSelectedValue={value => handleInputChange('category_id', value)} />}

            <HiddenField name='id' setValue={value => handleInputChange('id', value)} value={processRule.id} />

            <ErrorForms errors={errors} setErrors={setErrors} />
            <ButtonsModal item={processRule} name="Regras de processos" onSubmit={submit} deleteItem={onDelete} />
        </>
    );
};

export default ProcessRuleForm;
