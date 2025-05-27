'use client';

import React, { useState } from 'react';
import ButtonsModal from '../../components/modal/buttons-modal';
import Company, { ValidateCompanyForm } from '@/app/entities/company/company';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import NewCompany from '@/app/api/company/new/company';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/utils/error';
import { HiddenField, TextField } from '@/app/components/modal/field';
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
    const [error, setError] = useState<RequestError | null>(null);
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

    const handleSubmit = async () => {
        setError(null);
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

            router.push('/pages/new-order');
            modalHandler.hideModal(modalName);

        } catch (error) {
            setError(error as RequestError);
        }
    };

    const handleUpdate = async () => {
        setError(null);
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

            modalHandler.hideModal(modalName);

        } catch (error) {
            setError(error as RequestError);
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

            <hr className="my-4" />

            <HiddenField name="id" value={company.id} setValue={value => handleInputChange('id', value)} />

            {error && <p className="text-red-500">{error.message}</p>}
            <ErrorForms errors={errors} />
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
