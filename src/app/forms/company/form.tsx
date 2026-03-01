'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ButtonsModal from '../../components/modal/buttons-modal';
import Company, { SchemaCompany, SchemaCompanyUpdate } from '@/app/entities/company/company';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import NewCompany from '@/app/api/company/new/company';
// ErrorForms removed - using errors from r-h-f
import RequestError from '@/app/utils/error';
import { HiddenField, TextField, CheckboxField, NumberField, SelectField, ImageField } from '@/app/components/modal/field';
import PriceField from '@/app/components/modal/fields/price';
import Decimal from 'decimal.js';
import Access from '@/app/api/auth/access/access';
import { useRouter } from 'next/navigation';
import PatternField from '@/app/components/modal/fields/pattern';
import { useModal } from '@/app/context/modal/context';
import UpdateCompany from '@/app/api/company/update/company';
import FormArrayPattern from '@/app/components/modal/form-array-pattern';
import printService from '@/app/utils/print-service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import GetAllCompanyCategories from '@/app/api/company-category/list';
import { CompanyCategory } from '@/app/entities/company/company-category';
import { MultiSelect } from '@/app/components/ui/multi-select';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, Settings } from 'lucide-react';
import { FaSearch } from 'react-icons/fa';
import GetAddressByCEP from '../../api/busca-cep/busca-cep';
import { addressUFsWithId } from '../../entities/address/utils';

const CompanyForm = ({ item, isUpdate }: CreateFormsProps<Company>) => {
    const modalName = isUpdate ? 'edit-company-' + item?.id : 'new-company'
    const defaultPreferences = {
        enable_delivery: 'true',
        enable_table: 'true',
        enable_pickup: 'true',
        min_order_value_for_free_delivery: '0',
        table_tax_rate: '10',
        min_delivery_tax: '5',
        enable_print_order_on_pend_order: 'false',
        printer_order: '',
        enable_print_order_on_ship_delivery: 'false',
        printer_delivery: '',
        enable_print_items_on_finish_process: 'false',
        printer_shift_report: '',
    }
    const initialValues = useMemo(() => {
        const c = new Company(item || { preferences: defaultPreferences, contacts: [''] });
        return {
            ...c,
            contacts: (c.contacts || ['']).map(contact => ({ value: contact }))
        };
    }, [item]);

    const {
        handleSubmit,
        setValue,
        watch,
        control,
        formState: { errors }
    } = useForm<any>({
        resolver: zodResolver(isUpdate ? SchemaCompanyUpdate : SchemaCompany) as any,
        defaultValues: initialValues
    });

    const company = watch();
    const router = useRouter();
    const { fields, append, remove, update: updateContact } = useFieldArray({
        control,
        name: "contacts"
    });

    const { data: sessionData, update } = useSession();
    const modalHandler = useModal();
    const queryClient = useQueryClient();
    const [isSaving, setIsSaving] = useState(false);

    const { data: categoriesResponse } = useQuery<CompanyCategory[]>({
        queryKey: ['company-categories'],
        queryFn: () => GetAllCompanyCategories((sessionData as any)!),
        enabled: !!(sessionData as any)?.user?.access_token,
        refetchInterval: 30000,
    });

    const categories = useMemo(() => categoriesResponse || [], [categoriesResponse])

    const { data: printersResponse } = useQuery({
        queryKey: ['printers'],
        queryFn: () => printService.getPrinters(),
        enabled: !!(sessionData as any)?.user?.access_token,
        refetchInterval: 30000,
    })

    const printers = useMemo(() => printersResponse?.map((p: any) => ({ id: p.name, name: p.name })) || [], [printersResponse])

    const handlePreferenceChange = (key: string, value: any) => {
        setValue(`preferences.${key}` as any, value instanceof Decimal ? value.toFixed(2) : String(value));
    };

    const handleContactChange = (index: number, value: string) => {
        const newContacts = [...fields];
        (newContacts[index] as any).value = value;
        setValue('contacts', newContacts as any);
    };

    const fetchAddress = async () => {
        if (!company.address?.cep) return;
        try {
            const addressFound = await GetAddressByCEP(company.address.cep);

            if (addressFound.cep.replace("-", "") === company.address.cep.replace("-", "")) {
                setValue('address.street', addressFound.logradouro);
                setValue('address.neighborhood', addressFound.bairro);
                setValue('address.city', addressFound.localidade);
                setValue('address.uf', addressFound.uf);
            }
        } catch (error) {
            notifyError('CEP não encontrado');
        }
    };

    const onSave = async (data: any) => {
        if (!sessionData) return;

        const formData = {
            ...data,
            contacts: data.contacts.map((c: any) => c.value)
        }

        setIsSaving(true);
        try {
            const responseNewCompany = await NewCompany(formData, sessionData);

            const response = await Access({ schema: responseNewCompany.schema }, (sessionData as any));

            await update({
                ...sessionData,
                user: {
                    ...((sessionData as any).user),
                    access_token: response,
                },
            });

            notifySuccess('Empresa criada com sucesso');
            router.push('/pages/new-order');
            modalHandler.hideModal(modalName);

        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao criar empresa');
        } finally {
            setIsSaving(false);
        }
    };

    const onInvalid = (errors: any) => {
        console.log('Validation Errors:', errors);
        notifyError('Formulário incompleto. Verifique os campos obrigatórios.');
    };

    const onUpdate = async (data: any) => {
        if (!sessionData) return;

        const formData = {
            ...data,
            contacts: data.contacts.map((c: any) => c.value)
        }

        setIsSaving(true);
        try {
            await UpdateCompany(formData, (sessionData as any));
            queryClient.invalidateQueries({ queryKey: ['company'] });
            notifySuccess('Empresa atualizada com sucesso');
            modalHandler.hideModal(modalName);

        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao atualizar empresa');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="text-black space-y-6">
            {/* Seção: Informações Básicas */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações Básicas</h3>
                <div className="space-y-4">
                    <TextField friendlyName="Nome da loja" name="trade_name" value={company.trade_name} setValue={(value: string) => setValue('trade_name', value)} error={errors.trade_name?.message as string} />
                    <PatternField patternName='cnpj' friendlyName="Cnpj" name="cnpj" value={company.cnpj} setValue={(value: string) => setValue('cnpj', value)} formatted={true} error={errors.cnpj?.message as string} />
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Categorias da Empresa</label>
                        <MultiSelect
                            options={categories}
                            selected={company.categories || []}
                            onChange={(selected: any[]) => setValue('categories', selected as any)}
                            placeholder="Selecione as categorias"
                            emptyMessage="Nenhuma categoria encontrada."
                        />
                    </div>

                    <ImageField
                        friendlyName="Logo"
                        name="image_path"
                        setValue={(value: string) => setValue('image_path', value)}
                        value={company.image_path}
                        optional
                        onUploadError={(error: string) => notifyError(error)}
                    />
                </div>
            </div>

            {/* Seção: Contatos */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 transition-all duration-300 hover:shadow-md">
                <FormArrayPattern
                    title='Contatos'
                    singleItemName='Contato'
                    items={fields.map(f => (f as any).value ?? '')}
                    patternName='full-phone'
                    onAdd={() => append({ value: '' })}
                    onRemove={(index: number) => remove(index)}
                    onChange={handleContactChange}
                    errors={errors.contacts as any}
                />
            </div>

            {/* Seção: Endereço */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-blue-200">Endereço</h3>
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <PatternField
                                patternName='cep'
                                name="address.cep"
                                friendlyName="Cep"
                                placeholder="Digite o cep"
                                setValue={(value: string) => setValue('address.cep', value)}
                                value={company.address?.cep || ''}
                                formatted={true}
                                error={(errors.address as any)?.cep?.message}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="block text-sm font-bold mb-2">&nbsp;</label>
                            <button
                                type="button"
                                className='flex items-center justify-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md h-[42px] px-6'
                                onClick={fetchAddress}
                            >
                                <FaSearch />&nbsp;<span>Buscar</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 sm:flex-[2] transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                name="address.street"
                                friendlyName="Rua"
                                placeholder="Digite sua rua"
                                setValue={(value: string) => setValue('address.street', value)}
                                value={company.address?.street || ''}
                                error={(errors.address as any)?.street?.message}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                name="address.number"
                                friendlyName="Numero"
                                placeholder="Digite o numero"
                                setValue={(value: string) => setValue('address.number', value)}
                                value={company.address?.number || ''}
                                error={(errors.address as any)?.number?.message}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                name="address.neighborhood"
                                friendlyName="Bairro"
                                placeholder="Digite o bairro"
                                setValue={(value: string) => setValue('address.neighborhood', value)}
                                value={company.address?.neighborhood || ''}
                                error={(errors.address as any)?.neighborhood?.message}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                name="address.complement"
                                friendlyName="Complemento"
                                placeholder="Digite o complemento"
                                setValue={(value: string) => setValue('address.complement', value)}
                                value={company.address?.complement || ''}
                                optional
                                error={(errors.address as any)?.complement?.message}
                            />
                        </div>
                    </div>

                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <TextField
                            name="address.reference"
                            friendlyName="Referência"
                            placeholder="Digite a referência"
                            setValue={(value: string) => setValue('address.reference', value)}
                            value={company.address?.reference || ''}
                            optional
                            error={(errors.address as any)?.reference?.message}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 sm:flex-[2] transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField
                                name="address.city"
                                friendlyName="Cidade"
                                placeholder="Digite a cidade"
                                setValue={(value: string) => setValue('address.city', value)}
                                value={company.address?.city || ''}
                                error={(errors.address as any)?.city?.message}
                            />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <SelectField
                                name="address.uf"
                                friendlyName="Estado"
                                setSelectedValue={(value: string) => setValue('address.uf', value)}
                                selectedValue={company.address?.uf || ''}
                                values={addressUFsWithId}
                                error={(errors.address as any)?.uf?.message}
                            />
                        </div>
                    </div>
                </div>
            </div>

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
                                        setSelectedValue={value => setValue('monthly_payment_due_day', parseInt(value))}
                                        disabled={isBlocked}
                                    />
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}

            <Collapsible className="bg-gradient-to-br from-white to-purple-50 rounded-lg shadow-sm border border-purple-100 transition-all duration-300 hover:shadow-md overflow-hidden group">
                <CollapsibleTrigger asChild>
                    <div className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-purple-50/50 transition-colors">
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-purple-100 rounded-lg text-purple-600 transition-transform duration-300 group-data-[state=open]:rotate-90'>
                                <Settings className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Preferências</h3>
                        </div>
                        <div className='flex items-center gap-2 text-purple-500 font-medium text-sm'>
                            <span>{company.preferences.enable_delivery === 'true' ? 'Ativo' : 'Parcial'}</span>
                            <ChevronDown className="w-5 h-5 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="p-6 pt-0 border-t border-purple-100/50 space-y-4">
                        {/* Grupo: Entregas */}
                        <div className='p-4 border border-blue-100 rounded-xl bg-blue-50/20 space-y-4'>
                            <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                                <CheckboxField
                                    friendlyName="Entregas disponível"
                                    name="enable_delivery" optional
                                    value={company.preferences.enable_delivery === 'true'}
                                    setValue={(value: boolean) => handlePreferenceChange('enable_delivery', value)}
                                />
                                <p className="text-xs mt-1 text-muted-foreground">
                                    {company.preferences.enable_delivery === 'true'
                                        ? '✓ Clientes poderão fazer pedidos para entrega pelo menu digital'
                                        : '⚠️ A opção de entrega não aparecerá para os clientes'}
                                </p>
                            </div>

                            <div className={`space-y-4 transition-all duration-200 ${company.preferences.enable_delivery === 'false' ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                                <div className='flex flex-col sm:flex-row gap-4 justify-between'>
                                    <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                                        <PriceField
                                            friendlyName="Taxa mínima de entrega"
                                            name="min_delivery_tax" optional
                                            value={new Decimal(company.preferences.min_delivery_tax || '0')}
                                            setValue={(value: Decimal) => handlePreferenceChange('min_delivery_tax', value)}
                                            disabled={company.preferences.enable_delivery === 'false'}
                                        />
                                    </div>

                                    <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                                        <PriceField
                                            friendlyName="Taxa de entrega por KM"
                                            name="delivery_fee_per_km" optional
                                            value={new Decimal(company.preferences.delivery_fee_per_km || '0')}
                                            setValue={(value: Decimal) => handlePreferenceChange('delivery_fee_per_km', value)}
                                            disabled={company.preferences.enable_delivery === 'false'}
                                        />
                                    </div>
                                </div>

                                <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                                    <PriceField
                                        friendlyName="Mínimo para entrega gratuita"
                                        name="min_order_value_for_free_delivery" optional
                                        value={new Decimal(company.preferences.min_order_value_for_free_delivery || '0')}
                                        setValue={(value: Decimal) => handlePreferenceChange('min_order_value_for_free_delivery', value)}
                                        disabled={company.preferences.enable_delivery === 'false'}
                                    />
                                    <p className="text-xs mt-1 text-muted-foreground">
                                        {new Decimal(company.preferences.min_order_value_for_free_delivery || '0').isZero()
                                            ? '⚠️ Zero = desativado'
                                            : '✓ Pedidos acima deste valor terão entrega gratuita'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Grupo: Mesas */}
                        <div className='p-4 border border-amber-100 rounded-xl bg-amber-50/20 space-y-4'>
                            <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                                <CheckboxField
                                    friendlyName="Mesas disponíveis"
                                    name="enable_table" optional
                                    value={company.preferences.enable_table === 'true'}
                                    setValue={(value: boolean) => handlePreferenceChange('enable_table', value)}
                                />
                                <p className="text-xs mt-1 text-muted-foreground">
                                    {company.preferences.enable_table === 'true'
                                        ? '✓ O auto-atendimento em mesa pelo QR Code estará ativado'
                                        : '⚠️ O auto-atendimento em mesa estará desativado'}
                                </p>
                            </div>

                            <div className={`transition-all duration-200 ${company.preferences.enable_table === 'false' ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                                <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                                    <NumberField
                                        friendlyName="Taxa de mesa (%)"
                                        name="table_tax_rate" optional
                                        value={parseFloat(company.preferences.table_tax_rate || '10')}
                                        setValue={(value: number) => handlePreferenceChange('table_tax_rate', value)}
                                        disabled={company.preferences.enable_table !== 'true'}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Grupo: Retirada */}
                        <div className='p-4 border border-green-100 rounded-xl bg-green-50/20 space-y-4'>
                            <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                                <CheckboxField
                                    friendlyName="Retirada/Balcão disponível"
                                    name="enable_pickup" optional
                                    value={company.preferences.enable_pickup === 'true'}
                                    setValue={(value: boolean) => handlePreferenceChange('enable_pickup', value)}
                                />
                                <p className="text-xs mt-1 text-muted-foreground">
                                    {company.preferences.enable_pickup === 'true'
                                        ? '✓ Clientes poderão pedir para retirar no balcão'
                                        : '⚠️ Pedidos para retirada/balcão estarão desativados'}
                                </p>
                            </div>
                        </div>

                        {/* Impressora para pedido */}
                        <div className='flex flex-col sm:flex-row gap-4 justify-between p-4 border border-purple-100 rounded-xl bg-purple-50/20'>
                            <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                                <CheckboxField
                                    friendlyName="Deseja imprimir ao lançar o pedido?"
                                    name="enable_print_order_on_pend_order" optional
                                    value={company.preferences.enable_print_order_on_pend_order === 'true'}
                                    setValue={(value: boolean) => handlePreferenceChange('enable_print_order_on_pend_order', value)}
                                />
                            </div>
                            <div className={`flex-1 transform transition-all duration-200 ${company.preferences.enable_print_order_on_pend_order === 'false' ? 'opacity-50 grayscale-[0.5]' : 'hover:scale-[1.01]'}`}>
                                <SelectField
                                    friendlyName="Impressora de pedido"
                                    name="printer_order"
                                    values={printers}
                                    selectedValue={company.preferences.printer_order || ''}
                                    setSelectedValue={(value: string) => handlePreferenceChange('printer_order', value)}
                                    disabled={company.preferences.enable_print_order_on_pend_order === 'false'}
                                />
                            </div>
                        </div>

                        {/* Impressora para entrega */}
                        <div className='flex flex-col sm:flex-row gap-4 justify-between p-4 border border-purple-100 rounded-xl bg-purple-50/20'>
                            <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                                <CheckboxField
                                    friendlyName="Deseja imprimir ao Enviar a entrega?"
                                    name="enable_print_order_on_ship_delivery" optional
                                    value={company.preferences.enable_print_order_on_ship_delivery === 'true'}
                                    setValue={(value: boolean) => handlePreferenceChange('enable_print_order_on_ship_delivery', value)}
                                />
                            </div>
                            <div className={`flex-1 transform transition-all duration-200 ${company.preferences.enable_print_order_on_ship_delivery === 'false' ? 'opacity-50 grayscale-[0.5]' : 'hover:scale-[1.01]'}`}>
                                <SelectField
                                    friendlyName="Impressora de entrega"
                                    name="printer_delivery" optional
                                    values={printers}
                                    selectedValue={company.preferences.printer_delivery || ''}
                                    setSelectedValue={(value: string) => handlePreferenceChange('printer_delivery', value)}
                                    disabled={company.preferences.enable_print_order_on_ship_delivery === 'false'}
                                />
                            </div>
                        </div>
                        {/* Impressora para finalizar processo */}
                        <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                            <CheckboxField
                                friendlyName="Deseja imprimir ao finalizar o processo?"
                                name="enable_print_items_on_finish_process" optional
                                value={company.preferences.enable_print_items_on_finish_process === 'true'}
                                setValue={(value: boolean) => handlePreferenceChange('enable_print_items_on_finish_process', value)}
                            />
                            <p className="text-sm text-gray-500 mt-2 ml-1">
                                * A impressora utilizada será a configurada em cada categoria
                            </p>
                        </div>

                        {/* Impressora para turno */}
                        <div className='flex flex-col sm:flex-row gap-4 justify-between'>
                            <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                                <SelectField
                                    friendlyName="Impressora de resumo de turno"
                                    name="printer_shift_report" optional
                                    values={printers}
                                    selectedValue={company.preferences.printer_shift_report || ''}
                                    setSelectedValue={(value: string) => handlePreferenceChange('printer_shift_report', value)}
                                />
                            </div>
                            <div className="flex-1"></div>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            <HiddenField name="id" value={company.id} setValue={value => setValue('id', value as any)} />
            {
                !isUpdate && <ButtonsModal
                    item={company}
                    name="Empresa"
                    onSubmit={handleSubmit(onSave, onInvalid)}
                    isPending={isSaving}
                />
            }
            {
                isUpdate && <ButtonsModal
                    item={company}
                    name="Empresa"
                    onSubmit={handleSubmit(onUpdate, onInvalid)}
                    isPending={isSaving}
                />
            }
        </div >
    );
};

export default CompanyForm;
