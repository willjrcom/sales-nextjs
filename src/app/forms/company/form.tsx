'use client';

import React, { useState, useEffect } from 'react';
import ButtonsModal from '../../components/modal/buttons-modal';
import Company, { ValidateCompanyForm } from '@/app/entities/company/company';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import NewCompany from '@/app/api/company/new/company';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { HiddenField, TextField, CheckboxField, NumberField, SelectField } from '@/app/components/modal/field';
import PriceField from '@/app/components/modal/fields/price';
import Decimal from 'decimal.js';
import Access from '@/app/api/auth/access/access';
import { useRouter } from 'next/navigation';
import PatternField from '@/app/components/modal/fields/pattern';
import { useModal } from '@/app/context/modal/context';
import GetCompany from '@/app/api/company/company';
import UpdateCompany from '@/app/api/company/update/company';
import FormArrayPattern from '@/app/components/modal/form-array-pattern';

const CompanyForm = ({ item, isUpdate }: CreateFormsProps<Company>) => {
    const modalName = isUpdate ? 'edit-company-' + item?.id : 'new-company'
    const [company, setCompany] = useState<Company>(item || new Company());
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const { data, update } = useSession();
    const router = useRouter();
    const modalHandler = useModal();

    const handleInputChange = (field: keyof Company, value: any) => {
        setCompany(prev => ({ ...prev, [field]: value }));
    };

    const handleAddContact = () => {
        setCompany(prev => ({
            ...prev,
            contacts: [...prev.contacts, '']
        }));
    };

    const handleRemoveContact = (index: number) => {
        setCompany(prev => ({
            ...prev,
            contacts: prev.contacts.filter((_, i) => i !== index)
        }));
    };

    const handleContactChange = (index: number, value: string) => {
        setCompany(prev => {
            const updatedContacts = [...prev.contacts];
            updatedContacts[index] = value;
            return { ...prev, contacts: updatedContacts };
        });
    };

    const handlePreferenceChange = (key: string, value: any) => {
        setCompany(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [key]: value instanceof Decimal ? value.toFixed(2) : String(value),
            },
        }));
    };

    // Carrega impressoras disponíveis via Electron
    const [printers, setPrinters] = useState<{ id: string; name: string }[]>([]);
    useEffect(() => {
        if (typeof window !== 'undefined' && window.electronAPI?.getPrinters) {
            (async () => {
                try {
                    if (!window.electronAPI) return;
                    const list = await window.electronAPI.getPrinters();
                    setPrinters(
                        list.map((p: any) => ({ id: p.name, name: p.name }))
                    );
                } catch (err) {
                    console.error('Error loading printers', err);
                }
            })();
        }
    }, []);

    const handleSubmit = async () => {
        if (!data) return;

        const validationErrors = ValidateCompanyForm(company);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const responseNewCompany = await NewCompany(company, data);
            company.id = responseNewCompany.company_id;

            const response = await Access({ schema: responseNewCompany.schema }, data);

            await update({
                ...data,
                user: {
                    access_token: response
                },
            });

            const currentCompany = await GetCompany(data, response);

            await update({
                ...data,
                user: {
                    ...data.user,
                    current_company: currentCompany,
                },
            })

            notifySuccess('Empresa criada com sucesso');
            router.push('/pages/new-order');
            modalHandler.hideModal(modalName);

        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao criar empresa');
        }
    };

    const handleUpdate = async () => {
        if (!data) return;

        const validationErrors = ValidateCompanyForm(company);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            await UpdateCompany(company, data);
            const currentCompany = await GetCompany(data);

            await update({
                ...data,
                user: {
                    ...data.user,
                    current_company: currentCompany,
                },
            })

            notifySuccess('Empresa atualizada com sucesso');
            modalHandler.hideModal(modalName);

        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao atualizar empresa');
        }
    };

    return (
        <>
            <TextField friendlyName="Nome da loja" name="trade_name" value={company.trade_name} setValue={value => handleInputChange('trade_name', value)} />
            <PatternField patternName='cnpj' friendlyName="Cnpj" name="cnpj" value={company.cnpj} setValue={value => handleInputChange('cnpj', value)} formatted={true} />

            <hr className="my-4" />
            <FormArrayPattern
                title='Contatos'
                singleItemName='Contato'
                items={company.contacts}
                patternName='full-phone'
                onAdd={handleAddContact}
                onRemove={handleRemoveContact}
                onChange={handleContactChange}
            />

            {/* Preferences */}
            <hr className="my-4" />
            <h2 className="text-md font-medium mb-2">Preferências</h2>

            <div className='flex justify-between'>
                <CheckboxField
                    friendlyName="Entregas disponível"
                    name="enable_delivery"
                    value={company.preferences.enable_delivery === 'true'}
                    setValue={value => handlePreferenceChange('enable_delivery', value)}
                />
                <CheckboxField
                    friendlyName="Mesas disponíveis"
                    name="enable_table"
                    value={company.preferences.enable_table === 'true'}
                    setValue={value => handlePreferenceChange('enable_table', value)}
                />
            </div>

            <div className='flex justify-between'>
                <CheckboxField
                    friendlyName="Habilitar valor mínimo para entrega gratuita"
                    name="enable_min_order_value_for_free_delivery"
                    value={company.preferences.enable_min_order_value_for_free_delivery === 'true'}
                    setValue={value => handlePreferenceChange('enable_min_order_value_for_free_delivery', value)}
                />

                <PriceField
                    friendlyName="Valor mínimo para entrega gratuita"
                    name="min_order_value_for_free_delivery"
                    value={new Decimal(company.preferences.min_order_value_for_free_delivery || '0')}
                    setValue={value => handlePreferenceChange('min_order_value_for_free_delivery', value)}
                    disabled={company.preferences.enable_min_order_value_for_free_delivery !== 'true'}
                />
            </div>

            {/* Taxas */}
            <div className='flex justify-between'>
                <NumberField
                    friendlyName="Taxa de mesa (%)"
                    name="table_tax_rate"
                    value={parseFloat(company.preferences.table_tax_rate || '0')}
                    setValue={value => handlePreferenceChange('table_tax_rate', value)}
                    disabled={company.preferences.enable_table !== 'true'}
                />

                <PriceField
                    friendlyName="Taxa mínima de entrega"
                    name="min_delivery_tax"
                    value={new Decimal(company.preferences.min_delivery_tax || '0')}
                    setValue={value => handlePreferenceChange('min_delivery_tax', value)}
                />
            </div>

            {/* Impressora para pedido */}
            <div className='flex justify-between'>
                <CheckboxField
                    friendlyName="Deseja imprimir ao lançar o pedido?"
                    name="enable_print_order_on_pend_order"
                    value={company.preferences.enable_print_order_on_pend_order === 'true'}
                    setValue={value => handlePreferenceChange('enable_print_order_on_pend_order', value)}
                />
                <SelectField
                    friendlyName="Impressora de pedido"
                    name="printer_order_on_pend_order"
                    values={printers}
                    selectedValue={company.preferences.printer_order_on_pend_order || ''}
                    setSelectedValue={value => handlePreferenceChange('printer_order_on_pend_order', value)}
                    optional
                    disabled={company.preferences.enable_print_order_on_pend_order === 'false'}
                />
            </div>

            {/* Impressora para entrega */}
            <div className='flex justify-between'>
                <CheckboxField
                    friendlyName="Deseja imprimir ao lançar a entrega?"
                    name="enable_print_order_on_ship_delivery"
                    value={company.preferences.enable_print_order_on_ship_delivery === 'true'}
                    setValue={value => handlePreferenceChange('enable_print_order_on_ship_delivery', value)}
                />
                <SelectField
                    friendlyName="Impressora de entrega"
                    name="printer_delivery_on_ship_delivery"
                    values={printers}
                    selectedValue={company.preferences.printer_delivery_on_ship_delivery || ''}
                    setSelectedValue={value => handlePreferenceChange('printer_delivery_on_ship_delivery', value)}
                    optional
                    disabled={company.preferences.enable_print_order_on_ship_delivery === 'false'}
                />
            </div>

            {/* Impressora para finalizar processo */}
            <CheckboxField
                friendlyName="Deseja imprimir ao finalizar o processo?"
                name="enable_print_items_on_finish_process"
                value={company.preferences.enable_print_items_on_finish_process === 'true'}
                setValue={value => handlePreferenceChange('enable_print_items_on_finish_process', value)}
            />
            
            <HiddenField name="id" value={company.id} setValue={value => handleInputChange('id', value)} />

            <ErrorForms errors={errors} setErrors={setErrors} />
            {!isUpdate && <ButtonsModal
                item={company}
                name="Empresa"
                onSubmit={handleSubmit}
            />}
            {isUpdate && <ButtonsModal
                item={company}
                name="Empresa"
                onSubmit={handleUpdate}
            />}
        </>
    );
};

export default CompanyForm;
