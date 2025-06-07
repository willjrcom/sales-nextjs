import { TextField, DateField } from "../../components/modal/field";
import AddressForm from "../address/form";
import Person from "@/app/entities/person/person";
import ContactForm from "../contact/form";
import { useCallback, useEffect, useState } from "react";
import Contact from "@/app/entities/contact/contact";
import Address from "@/app/entities/address/address";
import PatternField from "@/app/components/modal/fields/pattern";

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
        <div className="text-black">
            <TextField name="name" friendlyName="Nome" placeholder="Digite seu nome" setValue={value => handleInputChange('name', value)} value={person.name} disabled={isHidden} />

            <TextField name="email" friendlyName="Email" placeholder="Digite seu e-mail" setValue={value => handleInputChange('email', value)} value={person.email} optional={!isEmployee} disabled={isHidden} />

            <PatternField patternName="cpf" name="cpf" friendlyName="Cpf" placeholder="Digite seu cpf" setValue={value => handleInputChange('cpf', value)} value={person.cpf} optional={!isEmployee} disabled={isHidden} formatted={true} />

            <DateField name="birthday" friendlyName="Nascimento" setValue={value => handleInputChange('birthday', value)} value={person.birthday} optional={!isEmployee} disabled={isHidden} />

            <ContactForm contactParent={contact} setContactParent={setContact} isHidden={isHidden} />
            <AddressForm addressParent={person.address} setAddressParent={setAddress} isHidden={isHidden} />
        </div>
    );
}

export default PersonForm