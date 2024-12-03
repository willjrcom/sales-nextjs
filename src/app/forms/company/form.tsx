import React, { useState } from 'react';
import ButtonsModal from '../../components/modal/buttons-modal';
import Company, { ValidateCompanyForm } from '@/app/entities/company/company';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import NewCompany from '@/app/api/company/new/route';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/api/error';
import { useModal } from '@/app/context/modal/context';
import { HiddenField, TextField } from '@/app/components/modal/field';

const CompanyForm = ({ item, isUpdate }: CreateFormsProps<Company>) => {
    const modalName = 'new-company'; //isUpdate ? 'edit-company-' + item?.id : 
    const modalHandler = useModal();
    const [company, setCompany] = useState<Company>(item || new Company())
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState<RequestError | null>(null);
    const { data } = useSession();

    const handleInputChange = (field: keyof Company, value: any) => {
        setCompany(prev => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (!data) return;

        const validationErrors = ValidateCompanyForm(company);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);

        try {
            const response = await NewCompany(company, data)
            setError(null);

            if (!isUpdate) {
                company.id = response
            }

            modalHandler.hideModal(modalName);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    return (
        <>
            <TextField friendlyName='Cnpj' name='cnpj' value={company.cnpj} setValue={value => handleInputChange('cnpj', value)} />
            <TextField friendlyName='Email' name='email' value={company.email} setValue={value => handleInputChange('cnpj', value)} />
            <HiddenField name='id' value={company.id} setValue={value => handleInputChange('id', value)} />

            {error && <p className='text-red-500'>{error.message}</p>}
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