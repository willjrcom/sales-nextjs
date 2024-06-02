import { useState } from "react";
import{ TextField, DateField } from "../field";
import CreateAddressForm from "../address/create";

const CreatePersonForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');
    const [birthday, setBirthday] = useState(new Date());
    const [contact, setContact] = useState('');
    const [address, setAddress] = useState('');

    return (
        <>
            <TextField name="name" friendlyName="Nome" placeholder="Digite seu nome" setValue={setName} value={name}/>

            <TextField name="email" friendlyName="Email" placeholder="Digite seu e-mail" setValue={setEmail} value={email}/>

            <TextField name="cpf" friendlyName="Cpf" placeholder="Digite seu cpf" setValue={setCpf} value={cpf}/>

            <DateField name="birthday" friendlyName="Aniversário" setValue={setBirthday}/>

            <TextField name="contact" friendlyName="Celular" placeholder="Digite seu celular" setValue={setContact} value={contact}/>

            <CreateAddressForm/>
            <a onClick={() => console.log({name, email, cpf, birthday})}>Criar</a>
        </>
    );
}

export default CreatePersonForm

// Contact  *Contact               `bun:"rel:has-one,join:id=object_id,notnull" json:"contact,omitempty"`
// Address  *addressentity.Address `bun:"rel:has-one,join:id=object_id,notnull" json:"address,omitempty"`