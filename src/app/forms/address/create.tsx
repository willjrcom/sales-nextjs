import React, { useState } from 'react';
import { HiddenField, TextField } from '../field';

const CreateAddressForm = () => {
    const [street, setStreet] = useState('')
    const [number, setNumber] = useState('')
    const [neighborhood, setNeighborhood] = useState('')
    const [complement, setComplement] = useState('')
    const [reference, setReference] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [cep, setCep] = useState('')
    const [objectId, setObjectId] = useState('')

    return (
        <>
        <br/>
        <h2 className='text-xl'>Endereço</h2>
        <hr className="my-4" />

        <TextField name="street" friendlyName="Rua" placeholder="Digite sua rua" setValue={setStreet} value={street}/>

        <TextField name="number" friendlyName="Numero" placeholder="Digite o numero" setValue={setNumber} value={number}/>

        <TextField name="neighborhood" friendlyName="Bairro" placeholder="Digite o bairro" setValue={setNeighborhood} value={neighborhood}/>

        <TextField name="complement" friendlyName="Complemento" placeholder="Digite o complemento" setValue={setComplement} value={complement}/>

        <TextField name="reference" friendlyName="Referência" placeholder="Digite a referência" setValue={setReference} value={reference}/>

        <TextField name="city" friendlyName="Cidade" placeholder="Digite a cidade" setValue={setCity} value={city}/>

        <TextField name="state" friendlyName="Estado" placeholder="Digite o estado" setValue={setState} value={state}/>

        <TextField name="cep" friendlyName="Cep" placeholder="Digite o cep" setValue={setCep} value={cep}/>

        <HiddenField name="object_id" setValue={setObjectId} value={objectId}/>
        </>
    );
};

export default CreateAddressForm;