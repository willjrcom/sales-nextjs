'use client';

import React, { useState } from 'react';
import { TextField, NumberField, HiddenField } from '../../components/modal/field';
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

const ProcessRuleForm = ({ item, isUpdate }: CreateFormsProps<ProcessRule>) => {
    const modalName = isUpdate ? 'edit-process-rule' : 'new-process-rule'
    const modalHandler = useModal();
    const processRule = item || new ProcessRule();
    const [id, setId] = useState(processRule.id);
    const [name, setName] = useState(processRule.name);
    const [description, setDescription] = useState(processRule.description);
    const [order, setOrder] = useState(processRule.order);
    const [imagePath, setImagePath] = useState(processRule.image_path);
    const [idealTime, setIdealTime] = useState(processRule.ideal_time);
    const [experimentalError, setExperimentalError] = useState(processRule.experimental_error);
    const [idealTimeFormatted, setIdealTimeFormatted] = useState(processRule.ideal_time_formatted);
    const [experimentalErrorFormatted, setExperimentalErrorFormatted] = useState(processRule.experimental_error_formatted);
    const [categoryId, setCategoryId] = useState(processRule.category_id);
    
    const { data } = useSession();
    const [error, setError] = useState<RequestError | null>(null);
    const context = useProcessRules()
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const submit = async () => {
        if (!data) return;

        processRule.id = id;
        processRule.name = name;
        processRule.description = description;
        processRule.order = order;
        processRule.image_path = imagePath;
        processRule.ideal_time = idealTime;
        processRule.experimental_error = experimentalError;
        processRule.ideal_time_formatted = idealTimeFormatted;
        processRule.experimental_error_formatted = experimentalErrorFormatted;
        processRule.category_id;

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
            <TextField friendlyName='Nome' name='name' setValue={setName} value={name}/>
            <TextField friendlyName='Descrição' name='description' setValue={setDescription} value={description}/>
            <NumberField friendlyName='Ordem' name='order' setValue={setOrder} value={order}/>
            <TextField friendlyName='Caminho da imagem' name='imagePath' setValue={setImagePath} value={imagePath}/>
            <NumberField friendlyName='Tempo ideal' name='idealTime' setValue={setIdealTime} value={idealTime}/>
            <NumberField friendlyName='Tempo experimental' name='experimentalError' setValue={setExperimentalError} value={experimentalError}/>
            <TextField friendlyName='Tempo ideal formatado' name='idealTimeFormatted' setValue={setIdealTimeFormatted} value={idealTimeFormatted}/>
            <TextField friendlyName='Tempo experimental formatado' name='experimentalErrorFormatted' setValue={setExperimentalErrorFormatted} value={experimentalErrorFormatted}/>
            <TextField friendlyName='Categoria' name='categoryId' value={categoryId} setValue={setCategoryId} disabled/>
            <HiddenField name='id' setValue={setId} value={id}/>

            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <ErrorForms errors={errors} />
            <ButtonsModal isUpdate={processRule.id !== ''} onSubmit={submit} onDelete={onDelete} onCancel={() => modalHandler.hideModal(modalName)}/>
        </>
    );
};

export default ProcessRuleForm;
