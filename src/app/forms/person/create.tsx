import { useEffect, useState } from "react";
import{ TextField, DateField, HiddenField } from "../field";
import CreateAddressForm from "../address/create";
import Address from "@/app/entities/address/address";
import Person from "@/app/entities/person/person";

interface PersonProps {
    person: Person
    onPersonChange: (updatedPerson: Person) => void;
}

const CreatePersonForm = ({person, onPersonChange}: PersonProps) => {
    const [id, setId] = useState(person.id);
    const [name, setName] = useState(person.name);
    const [email, setEmail] = useState(person.email);
    const [cpf, setCpf] = useState(person.cpf);
    const [birthday, setBirthday] = useState(person.birthday);
    const [contact, setContact] = useState(person.contact);
    const [address, setAddress] = useState<Address>(person.address);

    useEffect(() => {
        onPersonChange({
            id,
            name,
            email,
            cpf,
            birthday,
            contact,
            address,
        });
    }, [id, name, email, cpf, birthday, contact, address, onPersonChange]);

    return (
        <>
            <TextField name="name" friendlyName="Nome" placeholder="Digite seu nome" setValue={setName} value={name}/>

            <TextField name="email" friendlyName="Email" placeholder="Digite seu e-mail" setValue={setEmail} value={email}/>

            <TextField name="cpf" friendlyName="Cpf" placeholder="Digite seu cpf" setValue={setCpf} value={cpf}/>

            <DateField name="birthday" friendlyName="Aniversário" setValue={setBirthday} value={birthday} />

            <TextField name="contact" friendlyName="Celular" placeholder="Digite seu celular" setValue={setContact} value={contact}/>

            <CreateAddressForm address={address} onAddressChange={setAddress}/>

            <HiddenField name="id" setValue={setId} value={id}/>
        </>
    );
}

export default CreatePersonForm