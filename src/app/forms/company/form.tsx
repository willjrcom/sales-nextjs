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
import UpdateCompany from '@/app/api/company/update/company';
import FormArrayPattern from '@/app/components/modal/form-array-pattern';
import printService from '@/app/utils/print-service';
import Address from "@/app/entities/address/address";
import AddressForm from "../address/form";
import { useQueryClient } from '@tanstack/react-query';

const CompanyForm = ({ item, isUpdate }: CreateFormsProps<Company>) => {
    const modalName = isUpdate ? 'edit-company-' + item?.id : 'new-company'
    const defaultPreferences = {
        enable_delivery: 'true',
        enable_table: 'true',
        enable_min_order_value_for_free_delivery: 'false',
        min_order_value_for_free_delivery: '0',
        table_tax_rate: '10',
        min_delivery_tax: '5',
        enable_print_order_on_pend_order: 'false',
        printer_order_on_pend_order: '',
        enable_print_order_on_ship_delivery: 'false',
        printer_delivery_on_ship_delivery: '',
        enable_print_items_on_finish_process: 'false',
    }
    const [company, setCompany] = useState<Company>(item || new Company({ preferences: defaultPreferences }));
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [address, setAddress] = useState<Address>(company.address || new Address())
    const { data, update } = useSession();
    const router = useRouter();
    const modalHandler = useModal();
    const queryClient = useQueryClient();

    // Carrega impressoras disponíveis via Print Agent (WebSocket) ou Electron
    const [printers, setPrinters] = useState<{ id: string; name: string }[]>([]);

    const handleInputChange = (field: keyof Company, value: any) => {
        setCompany(prev => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        handleInputChange('address', address);
    }, [address]);

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


    useEffect(() => {
        (async () => {
            try {
                // Tenta usar Print Agent (WebSocket) primeiro
                const list = await printService.getPrinters();
                setPrinters(
                    list.map((p: any) => ({ id: p.name, name: p.name }))
                );
            } catch (err) {
                console.warn('Erro ao carregar impressoras via Print Agent', err);
            }
        })();
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
                    access_token: response,
                },
            });

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
            setCompany(company);
            queryClient.invalidateQueries({ queryKey: ['company'] });
            notifySuccess('Empresa atualizada com sucesso');
            modalHandler.hideModal(modalName);

        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao atualizar empresa');
        }
    };

    return (
        <div className="text-black space-y-6">
            {/* Seção: Informações Básicas */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações Básicas</h3>
                <div className="space-y-4">
                    <TextField friendlyName="Nome da loja" name="trade_name" value={company.trade_name} setValue={value => handleInputChange('trade_name', value)} />
                    <PatternField patternName='cnpj' friendlyName="Cnpj" name="cnpj" value={company.cnpj} setValue={value => handleInputChange('cnpj', value)} formatted={true} />
                </div>
            </div>

            {/* Seção: Contatos */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 transition-all duration-300 hover:shadow-md">
                <FormArrayPattern
                    title='Contatos'
                    singleItemName='Contato'
                    items={company.contacts}
                    patternName='full-phone'
                    onAdd={handleAddContact}
                    onRemove={handleRemoveContact}
                    onChange={handleContactChange}
                />
            </div>

            {/* Seção: Endereço */}
            {isUpdate && (
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 transition-all duration-300 hover:shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-blue-200">Endereço</h3>
                    <AddressForm addressParent={company.address} setAddressParent={setAddress} />
                </div>
            )}

            {/* Seção: Faturamento */}
            {isUpdate && (
                <div className="bg-gradient-to-br from-white to-yellow-50 rounded-lg shadow-sm border border-yellow-100 p-6 transition-all duration-300 hover:shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-yellow-200">Faturamento</h3>
                    {(() => {
                        let isBlocked = false;
                        let nextAllowedDate: Date | null = null;

                        if (company.monthly_payment_due_day_updated_at) {
                            const lastUpdate = new Date(company.monthly_payment_due_day_updated_at);
                            nextAllowedDate = new Date(lastUpdate);
                            nextAllowedDate.setMonth(nextAllowedDate.getMonth() + 3);

                            if (new Date() < nextAllowedDate) {
                                isBlocked = true;
                            }
                        }

                        return (
                            <>
                                <p className="text-sm text-gray-600 mb-4">
                                    Configure o dia de vencimento da fatura mensal. Só é permitido alterar a cada 3 meses.
                                    {company.monthly_payment_due_day_updated_at && (
                                        <span className="block mt-1 text-gray-600">
                                            Última alteração em: {new Date(company.monthly_payment_due_day_updated_at).toLocaleDateString()}.
                                        </span>
                                    )}
                                    {isBlocked && nextAllowedDate && (
                                        <span className="block mt-1 text-orange-600 font-medium">
                                            Bloqueado até: {nextAllowedDate.toLocaleDateString()}.
                                        </span>
                                    )}
                                </p>
                                <div className="w-full sm:w-1/2">
                                    <SelectField
                                        friendlyName="Dia de Vencimento Mensal"
                                        name="monthly_payment_due_day"
                                        values={Array.from({ length: 28 }, (_, i) => ({ id: String(i + 1), name: String(i + 1) }))}
                                        selectedValue={String(company.monthly_payment_due_day || '10')}
                                        setSelectedValue={value => handleInputChange('monthly_payment_due_day', parseInt(value))}
                                        disabled={isBlocked}
                                    />
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}

            <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg shadow-sm border border-purple-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">Preferências</h3>
                <div className="space-y-4">

                    <div className='flex flex-col sm:flex-row gap-4 justify-between'>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <CheckboxField
                                friendlyName="Entregas disponível"
                                name="enable_delivery"
                                value={company.preferences.enable_delivery === 'true'}
                                setValue={value => handlePreferenceChange('enable_delivery', value)}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <CheckboxField
                                friendlyName="Mesas disponíveis"
                                name="enable_table"
                                value={company.preferences.enable_table === 'true'}
                                setValue={value => handlePreferenceChange('enable_table', value)}
                            />
                        </div>
                    </div>

                    <div className='flex flex-col sm:flex-row gap-4 justify-between'>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <CheckboxField
                                friendlyName="Habilitar valor mínimo para entrega gratuita"
                                name="enable_min_order_value_for_free_delivery"
                                value={company.preferences.enable_min_order_value_for_free_delivery === 'true'}
                                setValue={value => handlePreferenceChange('enable_min_order_value_for_free_delivery', value)}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <PriceField
                                friendlyName="Valor mínimo para entrega gratuita"
                                name="min_order_value_for_free_delivery"
                                value={new Decimal(company.preferences.min_order_value_for_free_delivery || '0')}
                                setValue={value => handlePreferenceChange('min_order_value_for_free_delivery', value)}
                                disabled={company.preferences.enable_min_order_value_for_free_delivery !== 'true'}
                            />
                        </div>
                    </div>

                    {/* Taxas */}
                    <div className='flex flex-col sm:flex-row gap-4 justify-between'>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <NumberField
                                friendlyName="Taxa de mesa (%)"
                                name="table_tax_rate"
                                value={parseFloat(company.preferences.table_tax_rate || '10')}
                                setValue={value => handlePreferenceChange('table_tax_rate', value)}
                                disabled={company.preferences.enable_table !== 'true'}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <PriceField
                                friendlyName="Taxa mínima de entrega"
                                name="min_delivery_tax"
                                value={new Decimal(company.preferences.min_delivery_tax || '0')}
                                setValue={value => handlePreferenceChange('min_delivery_tax', value)}
                            />
                        </div>
                    </div>

                    {/* Impressora para pedido */}
                    <div className='flex flex-col sm:flex-row gap-4 justify-between'>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <CheckboxField
                                friendlyName="Deseja imprimir ao lançar o pedido?"
                                name="enable_print_order_on_pend_order"
                                value={company.preferences.enable_print_order_on_pend_order === 'true'}
                                setValue={value => handlePreferenceChange('enable_print_order_on_pend_order', value)}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
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
                    </div>

                    {/* Impressora para entrega */}
                    <div className='flex flex-col sm:flex-row gap-4 justify-between'>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <CheckboxField
                                friendlyName="Deseja imprimir ao lançar a entrega?"
                                name="enable_print_order_on_ship_delivery"
                                value={company.preferences.enable_print_order_on_ship_delivery === 'true'}
                                setValue={value => handlePreferenceChange('enable_print_order_on_ship_delivery', value)}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
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
                    </div>

                    {/* Impressora para finalizar processo */}
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <CheckboxField
                            friendlyName="Deseja imprimir ao finalizar o processo?"
                            name="enable_print_items_on_finish_process"
                            value={company.preferences.enable_print_items_on_finish_process === 'true'}
                            setValue={value => handlePreferenceChange('enable_print_items_on_finish_process', value)}
                        />
                        <p className="text-sm text-gray-500 mt-2 ml-1">
                            * A impressora utilizada será a configurada em cada categoria
                        </p>
                    </div>
                </div>
            </div>

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
        </div>
    );
};

export default CompanyForm;
