import { TextField, DateField, HiddenField } from "../../components/modal/field";
import AddressForm from "../address/form";
import Person from "@/app/entities/person/person";
import ContactForm from "../contact/form";
import { useCallback, useEffect, useState } from "react";
import Contact from "@/app/entities/contact/contact";
import Address from "@/app/entities/address/address";

interface PersonProps {
    person: Person;
    setPerson: React.Dispatch<React.SetStateAction<Person>>;
    isEmployee?: boolean;
}

const PersonForm = ({ person, setPerson, isEmployee }: PersonProps) => {
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
        <>
            <TextField name="name" friendlyName="Nome" placeholder="Digite seu nome" setValue={value => handleInputChange('name', value)} value={person.name}/>

            <TextField name="email" friendlyName="Email" placeholder="Digite seu e-mail" setValue={value => handleInputChange('email', value)} value={person.email} optional={!isEmployee}/>

            <TextField name="cpf" friendlyName="Cpf" placeholder="Digite seu cpf" setValue={value => handleInputChange('cpf', value)} value={person.cpf} optional={!isEmployee}/>

            <DateField name="birthday" friendlyName="Nascimento" setValue={value => handleInputChange('birthday', value)} value={person.birthday} optional={!isEmployee}/>

            <ContactForm contactParent={contact} setContactParent={setContact} />
            <AddressForm addressParent={person.address} setAddressParent={setAddress} />

            <HiddenField name="id" setValue={value => handleInputChange('id', value)} value={person.id}/>
        </>
    );
}

export default PersonForm