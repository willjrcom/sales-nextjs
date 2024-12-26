import React, { useState } from 'react';
import { HiddenField, NumberField, SelectField, TextField } from '../../components/modal/field';
import Address, { AddressTypesWithId } from '@/app/entities/address/address';

interface AddressFormProps {
    addressParent: Address;
    setAddressParent: React.Dispatch<React.SetStateAction<Address>>;
}

const AddressForm = ({addressParent, setAddressParent}: AddressFormProps) => {
    const [address, setAddress] = useState<Address>(addressParent || new Address());
    
    const handleInputChange = (field: keyof Address, value: any) => {
        setAddress(prev => ({ ...prev, [field]: value }));
        setAddressParent(prev => ({ ...prev, [field]: value }));
    };

    return (
        <>
        <br/>
        <h2 className='text-xl'>Endereço</h2>
        <hr className="my-4" />

        <TextField name="street" friendlyName="Rua" placeholder="Digite sua rua" setValue={value => handleInputChange('street', value)} value={address.street} />

        <TextField name="number" friendlyName="Numero" placeholder="Digite o numero" setValue={value => handleInputChange('number', value)} value={address.number}/>

        <TextField name="neighborhood" friendlyName="Bairro" placeholder="Digite o bairro" setValue={value => handleInputChange('neighborhood', value)} value={address.neighborhood}/>

        <TextField name="complement" friendlyName="Complemento" placeholder="Digite o complemento" setValue={value => handleInputChange('complement', value)} value={address.complement} optional/>

        <TextField name="reference" friendlyName="Referência" placeholder="Digite a referência" setValue={value => handleInputChange('reference', value)} value={address.reference} optional/>

        <TextField name="city" friendlyName="Cidade" placeholder="Digite a cidade" setValue={value => handleInputChange('city', value)} value={address.city}/>

        <TextField name="state" friendlyName="Estado" placeholder="Digite o estado" setValue={value => handleInputChange('state', value)} value={address.state}/>
        
        <SelectField name="address_type" friendlyName="Tipo de endereço" setSelectedValue={value => handleInputChange('address_type', value)} selectedValue={address.address_type} values={AddressTypesWithId}/>

        <TextField name="cep" friendlyName="Cep" placeholder="Digite o cep" setValue={value => handleInputChange('cep', value)} value={address.cep} optional/>

        {address.likeTax && <NumberField name="delivery_tax" friendlyName="Taxa de entrega" placeholder="Digite a taxa de entrega" setValue={value => handleInputChange('delivery_tax', value)} value={address.delivery_tax}/>}
        

        <HiddenField name="object_id" setValue={value => handleInputChange('object_id', value)} value={address.object_id}/>
        <HiddenField name="id" setValue={value => handleInputChange('id', value)} value={address.id}/>
        </>
    );
};

export default AddressForm;