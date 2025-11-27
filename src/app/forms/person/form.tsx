import { TextField, DateField, ImageField } from "../../components/modal/field";
import AddressForm from "../address/form";
import Person from "@/app/entities/person/person";
import ContactForm from "../contact/form";
import { useCallback, useEffect, useState } from "react";
import Contact from "@/app/entities/contact/contact";
import Address from "@/app/entities/address/address";
import PatternField from "@/app/components/modal/fields/pattern";
import { notifyError } from '@/app/utils/notifications';

interface PersonProps {
    person: Person;
    setPerson: React.Dispatch<React.SetStateAction<Person>>;
    isEmployee?: boolean;
    isHidden?: boolean;
}

const PersonForm = ({ person, setPerson, isEmployee, isHidden }: PersonProps) => {
    const [contact, setContact] = useState<Contact>(person.contact || new Contact())
    const [address, setAddress] = useState<Address>(person.address || new Address())

    const handleInputChange = useCallback((field: keyof Person, value: any) => {
        setPerson(prev => ({
            ...prev,
            [field]: value
        }));
    }, [setPerson]);

    useEffect(() => {
        handleInputChange('address', address);
    }, [address]);

    useEffect(() => {
        handleInputChange('contact', contact);
    }, [contact]);

    return (
        <div className="text-black space-y-6">
            {/* Seção: Informações Básicas */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Informações Básicas</h3>
                <TextField name="name" friendlyName="Nome" placeholder="Digite seu nome" setValue={value => handleInputChange('name', value)} value={person.name} disabled={isHidden} />
            </div>

            {/* Seção: Contato */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-blue-200">Contato</h3>
                <ContactForm contactParent={contact} setContactParent={setContact} isHidden={isHidden} />
            </div>

            {/* Seção: Endereço */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-sm border border-green-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-green-200">Endereço</h3>
                <AddressForm addressParent={person.address} setAddressParent={setAddress} isHidden={isHidden} />
            </div>

            {/* Seção: Dados Adicionais */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg shadow-sm border border-purple-100 p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-purple-200">Dados Adicionais</h3>
                <div className="space-y-4">

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <TextField name="email" friendlyName="Email" placeholder="Digite seu e-mail" setValue={value => handleInputChange('email', value)} value={person.email} optional={!isEmployee} disabled={isHidden} />

                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <ImageField
                                friendlyName='Imagem'
                                name='image_path'
                                setValue={value => handleInputChange('image_path', value)}
                                value={person.image_path}
                                optional
                                onUploadError={(error) => notifyError(error)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <PatternField patternName="cpf" name="cpf" friendlyName="CPF" placeholder="Digite seu cpf" setValue={value => handleInputChange('cpf', value)} value={person.cpf || ''} optional={!isEmployee} disabled={isHidden} formatted={true} />
                        </div>
                        <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                            <DateField name="birthday" friendlyName="Nascimento" setValue={value => handleInputChange('birthday', value)} value={person.birthday} optional={!isEmployee} disabled={isHidden} />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default PersonForm