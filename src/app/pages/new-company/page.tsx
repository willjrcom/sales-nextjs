'use client';

import Modal from "@/app/components/modal/modal";
import { ModalProvider } from "@/app/context/modal/context";
import CompanyForm from "@/app/forms/company/form"

const PageNewCompany = () => {
    return (
        <ModalProvider>
            <Modal show={true} title="Cadastrar Empresa">
                <CompanyForm/>
            </Modal>
        </ModalProvider>
    )
}

export default PageNewCompany