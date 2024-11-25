import { useEffect, useState } from "react";
import{ TextField, DateField, HiddenField } from "../field";
import CreateAddressForm from "../address/form";
import Address from "@/app/entities/address/address";
import Person from "@/app/entities/person/person";
import Contact from "@/app/entities/contact/contact";
import { format } from "date-fns";

interface PersonProps {
    person: Person
    onPersonChange: (updatedPerson: Person) => void;
}

const PersonForm = ({person, onPersonChange}: PersonProps) => {
    const [id, setId] = useState(person.id);
    const [name, setName] = useState(person.name);
    const [email, setEmail] = useState(person.email);
    const [cpf, setCpf] = useState(person.cpf);
    const [birthday, setBirthday] = useState(person.birthday);
    if (person.contact == null) person.contact = new Contact()
    const [contactDdd, setContactDdd] = useState(person.contact.ddd);
    const [contactNumber, setContactNumber] = useState(person.contact.number);
    const [address, setAddress] = useState<Address>(person.address);

    useEffect(() => {
        if (!birthday) return
        setBirthday(format(birthday, "yyyy-MM-dd"));
    }, []);

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

            <DateField name="birthday" friendlyName="Nascimento" setValue={setBirthday} value={birthday} />

            <div className="flex space-x-4">
                <div className="w-1/3">
                    <TextField name="ddd" friendlyName="DDD" placeholder="(xx)" setValue={setContactDdd} value={contactDdd} />
                </div>
                <div className="w-2/3">
                    <TextField name="number" friendlyName="Contato" placeholder="x xxxx-xxxx" setValue={setContactNumber} value={contactNumber} />
                </div>
            </div>
            <CreateAddressForm address={address} onAddressChange={setAddress} />

            <HiddenField name="id" setValue={setId} value={id}/>
        </>
    );
}

export default PersonForm