import { useState } from "react";
import{ TextField, DateField } from "../field";
import CreateAddressForm from "../address/create";
import Address from "@/app/entities/address/address";
import Person from "@/app/entities/person/person";

const CreatePersonForm = () => {
    const person: Person = new Person();
    const [name, setName] = useState(person.name);
    const [email, setEmail] = useState(person.email);
    const [cpf, setCpf] = useState(person.cpf);
    const [birthday, setBirthday] = useState(person.birthday);
    const [contact, setContact] = useState(person.contact.ddd + person.contact.number);
    const [address, setAddress] = useState<Address>(person.address);

    return (
        <>
            <TextField name="name" friendlyName="Nome" placeholder="Digite seu nome" setValue={setName} value={name}/>

            <TextField name="email" friendlyName="Email" placeholder="Digite seu e-mail" setValue={setEmail} value={email}/>

            <TextField name="cpf" friendlyName="Cpf" placeholder="Digite seu cpf" setValue={setCpf} value={cpf}/>

            <DateField name="birthday" friendlyName="Aniversário" setValue={setBirthday}/>

            <TextField name="contact" friendlyName="Celular" placeholder="Digite seu celular" setValue={setContact} value={contact}/>

            <CreateAddressForm address={address} onAddressChange={setAddress}/>
            <a onClick={() => console.log({name, email, cpf, address})}>Criar</a>
        </>
    );
}

export default CreatePersonForm