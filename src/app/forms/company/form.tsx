import React, { useState } from 'react';
import ButtonsModal from '../../components/modal/buttons-modal';
import Company, { ValidateCompanyForm } from '@/app/entities/company/company';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import NewCompany from '@/app/api/company/new/route';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/api/error';
import { HiddenField, TextField } from '@/app/components/modal/field';
import Access from '@/app/api/auth/access/route';
import { useRouter } from 'next/navigation';
import FormArray from '../../components/modal/form-array';
import PatternField from '@/app/components/modal/fields/pattern';
import { useModal } from '@/app/context/modal/context';
import GetCompany from '@/app/api/company/route';
import UpdateCompany from '@/app/api/company/update/route';

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

    const submit = async () => {
        if (!data) return;

        const validationErrors = ValidateCompanyForm(company);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const responseNewCompany = isUpdate ? await UpdateCompany(company, data) : await NewCompany(company, data);
            setError(null);

            if (!isUpdate) {
                const { company_id, schema } = responseNewCompany as { company_id: string, schema: string };
                company.id = company_id;
                
                const response = await Access({ schema: schema }, data);
                await update({
                    ...data,
                    user: {
                        idToken: response
                    },
                });

                router.push('/pages/new-order');
            }

            const currentCompany = await GetCompany(data);

            await update({
                ...data,
                user: {
                    ...data.user,
                    currentCompany: currentCompany,
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
            <PatternField patternName='cnpj' friendlyName="Cnpj" name="cnpj" value={company.cnpj} setValue={value => handleInputChange('cnpj', value)} />
            <TextField friendlyName="Email" name="email" value={company.email} setValue={value => handleInputChange('email', value)} />

            <hr className="my-4" />
            <FormArray
                title='Contatos'
                singleItemName='Contato'
                items={company.contacts}
                onAdd={handleAddContact}
                onRemove={handleRemoveContact}
                onChange={handleContactChange}
            />

            <hr className="my-4" />

            <HiddenField name="id" value={company.id} setValue={value => handleInputChange('id', value)} />

            {error && <p className="text-red-500">{error.message}</p>}
            <ErrorForms errors={errors} />
            <ButtonsModal
                item={company}
                name="Empresa"
                onSubmit={submit}
            />
        </>
    );
};

export default CompanyForm;
