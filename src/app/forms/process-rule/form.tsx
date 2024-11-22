'use client';

import React, { useState } from 'react';
import { TextField, NumberField, HiddenField } from '../field';
import ProcessRule from '@/app/entities/process-rule/process-rule';
import ButtonsModal from '../buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import DeleteProcessRule from '@/app/api/process-rule/delete/route';
import { useProcessRules } from '@/app/context/process-rule/context';
import ModalHandler from '@/app/components/modal/modal';

const ProcessRuleForm = ({ onSubmit, item }: CreateFormsProps<ProcessRule>) => {
    const modalHandler = ModalHandler();
    const processRule = item || new ProcessRule();
    const [id, setId] = useState(processRule.id);
    const [name, setName] = useState(processRule.name);
    const [description, setDescription] = useState(processRule.description);
    const [order, setOrder] = useState(processRule.order);
    const [imagePath, setImagePath] = useState(processRule.imagePath);
    const [idealTime, setIdealTime] = useState(processRule.ideal_time);
    const [experimentalError, setExperimentalError] = useState(processRule.experimental_error);
    const [idealTimeFormatted, setIdealTimeFormatted] = useState(processRule.ideal_time_formatted);
    const [experimentalErrorFormatted, setExperimentalErrorFormatted] = useState(processRule.experimental_error_formatted);
    const [categoryId, setCategoryId] = useState(processRule.category_id);
    
    const { data } = useSession();
    const [error, setError] = useState<string | null>(null);
    const context = useProcessRules()
    const submit = async () => {
        if (!data) return;

        processRule.id = id;
        processRule.name = name;
        processRule.description = description;
        processRule.order = order;
        processRule.imagePath = imagePath;
        processRule.ideal_time = idealTime;
        processRule.experimental_error = experimentalError;
        processRule.ideal_time_formatted = idealTimeFormatted;
        processRule.experimental_error_formatted = experimentalErrorFormatted;
        processRule.category_id;

        try {
            const response = await onSubmit(processRule, data)
    
            if (response) {
                modalHandler.setShowModal(false);
                context.addItem(processRule);
            }

        } catch (error) {
            setError((error as Error).message);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteProcessRule(processRule.id, data);
        modalHandler.setShowModal(false);
        context.removeItem(processRule.id)
    }

    return (
        <>
            {error && <p className="mb-4 text-red-500">{error}</p>}
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

            {error && <p className="mb-4 text-red-500">{error}</p>}
            <ButtonsModal isUpdate={processRule.id !== ''} onSubmit={submit} onDelete={onDelete} onCancel={() => modalHandler.setShowModal(false)}/>
        </>
    );
};

export default ProcessRuleForm;
