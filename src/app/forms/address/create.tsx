import React, { useEffect, useState } from 'react';
import { HiddenField, NumberField, TextField } from '../field';
import Address from '@/app/entities/address/address';

interface AddressProps {
    address: Address
    onAddressChange: (updatedAddress: Address) => void;
    likeTax: boolean;
}

const CreateAddressForm = ({address, onAddressChange, likeTax}:AddressProps) => {
    const [id, setId] = useState(address.id);
    const [street, setStreet] = useState(address.street);
    const [number, setNumber] = useState(address.number);
    const [neighborhood, setNeighborhood] = useState(address.neighborhood);
    const [complement, setComplement] = useState(address.complement);
    const [reference, setReference] = useState(address.reference);
    const [city, setCity] = useState(address.city);
    const [state, setState] = useState(address.state);
    const [cep, setCep] = useState(address.cep);
    const [deliveryTax, setDeliveryTax] = useState(address.delivery_tax);
    const [objectId, setObjectId] = useState(address.object_id);

    useEffect(() => {
        onAddressChange({
            id,
            street,
            number,
            neighborhood,
            complement,
            reference,
            city,
            state,
            cep,
            object_id: objectId,
            delivery_tax: deliveryTax,
        });
    }, [id, street, number, neighborhood, complement, reference, city, state, cep, objectId, deliveryTax, onAddressChange]);


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
        {likeTax && <NumberField name="delivery_tax" friendlyName="Taxa de entrega" placeholder="Digite a taxa de entrega" setValue={setDeliveryTax} value={deliveryTax}/>}
        

        <HiddenField name="object_id" setValue={setObjectId} value={objectId}/>
        <HiddenField name="id" setValue={setId} value={id}/>
        </>
    );
};

export default CreateAddressForm;