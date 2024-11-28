import React, { useState } from 'react';
import ButtonsModal from '../../components/modal/buttons-modal';
import Company, { ValidateCompanyForm } from '@/app/entities/company/company';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
// import DeleteCompany from '@/app/api/company/delete/route';
// import { useCompanies } from '@/app/context/company/context';
// import NewCompany from '@/app/api/company/new/route';
// import UpdateCompany from '@/app/api/company/update/route';
// import { useModal } from '@/app/context/modal/context';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/api/error';

const CompanyForm = ({ item, isUpdate }: CreateFormsProps<Company>) => {
    const modalName = isUpdate ? 'edit-company-' + item?.id : 'new-company'
    // const modalHandler = useModal();
    // const context = useCompanies();
    const [company, setPerson] = useState<Company>(item || new Company())
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState<RequestError | null>(null);
    const { data } = useSession();

    const submit = async () => {
        if (!data) return;
        
        const validationErrors = ValidateCompanyForm(company);
        if (Object.values(validationErrors).length > 0) return setErrors(validationErrors);
        
        try {
            // const response = isUpdate ? await UpdateCompany(company, data) : await NewCompany(company, data)
            // setError(null);

            // if (!isUpdate) {
            //     company.id = response
            //     context.addItem(company);
            // } else {
            //     context.updateItem(company);
            // }
            
            // modalHandler.hideModal(modalName);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        // DeleteCompany(company.id, data)
        // context.removeItem(company.id)
        // modalHandler.hideModal(modalName)
    }

    return (
        <>
            {error && <p className='text-red-500'>{error.message}</p>}
            <ErrorForms errors={errors} />
            <ButtonsModal
                isUpdate={company.id !== ""}
                onSubmit={submit}
                onDelete={onDelete}
                // onCancel={() => modalHandler.hideModal(modalName)}
            />
        </>
    );
    
};

export default CompanyForm;