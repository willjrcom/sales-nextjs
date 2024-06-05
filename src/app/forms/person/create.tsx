import { useEffect, useState } from "react";
import{ TextField, DateField, HiddenField } from "../field";
import CreateAddressForm from "../address/create";
import Address from "@/app/entities/address/address";
import Person from "@/app/entities/person/person";
import Contact from "@/app/entities/contact/contact";

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
    const [contactDdd, setContactDdd] = useState(person.contact.ddd);
    const [contactNumber, setContactNumber] = useState(person.contact.number);
    const [address, setAddress] = useState<Address>(person.address);

    useEffect(() => {
        const contact = new Contact()
        contact.ddd = contactDdd
        contact.number = contactNumber

        onPersonChange({
            id,
            name,
            email,
            cpf,
            birthday,
            contact,
            address,
        });
    }, [id, name, email, cpf, birthday, contactDdd, contactNumber, address, onPersonChange]);

    return (
        <>
            <TextField name="name" friendlyName="Nome" placeholder="Digite seu nome" setValue={setName} value={name}/>

            <TextField name="email" friendlyName="Email" placeholder="Digite seu e-mail" setValue={setEmail} value={email}/>

            <TextField name="cpf" friendlyName="Cpf" placeholder="Digite seu cpf" setValue={setCpf} value={cpf}/>

            <DateField name="birthday" friendlyName="Aniversário" setValue={setBirthday} value={birthday} />

            <div className="flex space-x-4">
                <div className="w-1/3">
                    <TextField name="ddd" friendlyName="DDD" placeholder="(xx)" setValue={setContactDdd} value={contactDdd} pattern="\(\d{2}\)"/>
                </div>
                <div className="w-2/3">
                    <TextField name="number" friendlyName="Número" placeholder="x xxxx-xxxx" setValue={setContactNumber} value={contactNumber}pattern="\d{1} \d{4}-\d{4}|\d{4}-\d{4}"/>
                </div>
            </div>
            <CreateAddressForm address={address} onAddressChange={setAddress}/>

            <HiddenField name="id" setValue={setId} value={id}/>
        </>
    );
}

export default CreatePersonForm