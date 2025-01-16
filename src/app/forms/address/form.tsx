import { useEffect, useState } from 'react';
import { HiddenField, NumberField, SelectField, TextField } from '../../components/modal/field';
import Address, { addressUFsWithId, AddressTypesWithId } from '@/app/entities/address/address';
import PatternField from '@/app/components/modal/fields/pattern';
import { useSession } from 'next-auth/react';
import GetAddressByCEP from '@/app/api/busca-cep/busca-cep';
import { FaSearch } from 'react-icons/fa';

interface AddressFormProps {
    addressParent: Address;
    setAddressParent: React.Dispatch<React.SetStateAction<Address>>;
    isHidden?: boolean;
}

const AddressForm = ({ addressParent, setAddressParent, isHidden }: AddressFormProps) => {
    const [address, setAddress] = useState<Address>(addressParent || new Address());
    const { data } = useSession();

    useEffect(() => {
        if (address.uf) return;

        const company = data?.user.currentCompany;
        if (!company) return;

        const companyAddress = company.address;
        if (!companyAddress) return;

        handleInputChange('uf', companyAddress.uf);
    }, [data?.user.currentCompany]);

    const handleInputChange = (field: keyof Address, value: any) => {
        const newAddress = Object.assign({}, { ...address, [field]: value }) as Address; 
        setAddress(newAddress);
        setAddressParent(newAddress);
    };

    const getAddress = async () => {
        try {
            const addressFound = await GetAddressByCEP(address.cep)

            if (addressFound.cep.replace("-", "") === address.cep.replace("-", "")) {
                const newAddress = Object.assign({}, 
                    { ...address, 
                        street: addressFound.logradouro, 
                        neighborhood: addressFound.bairro, 
                        city: addressFound.localidade, 
                        uf: addressFound.uf }
                    ) as Address;
                setAddress(newAddress);
                setAddressParent(newAddress);

            }
        } catch(error) {}
    }

    return (
        <>
        <br/>
        <h2 className='text-xl'>Endereço</h2>
        <hr className="my-4" />

        <div className="flex items-center space-x-4">
            <PatternField patternName='cep' name="cep" friendlyName="Cep" placeholder="Digite o cep" setValue={value => handleInputChange('cep', value)} value={address.cep} optional disabled={isHidden} />
            <button className='flex items-center space-x-4 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
            onClick={getAddress}><FaSearch />&nbsp;Buscar</button>
        </div>

        <TextField name="street" friendlyName="Rua" placeholder="Digite sua rua" setValue={value => handleInputChange('street', value)} value={address.street} disabled={isHidden} />

        <TextField name="number" friendlyName="Numero" placeholder="Digite o numero" setValue={value => handleInputChange('number', value)} value={address.number} disabled={isHidden} />

        <TextField name="neighborhood" friendlyName="Bairro" placeholder="Digite o bairro" setValue={value => handleInputChange('neighborhood', value)} value={address.neighborhood} disabled={isHidden} />

        <TextField name="complement" friendlyName="Complemento" placeholder="Digite o complemento" setValue={value => handleInputChange('complement', value)} value={address.complement} optional disabled={isHidden} />

        <TextField name="reference" friendlyName="Referência" placeholder="Digite a referência" setValue={value => handleInputChange('reference', value)} value={address.reference} optional disabled={isHidden} />

        <TextField name="city" friendlyName="Cidade" placeholder="Digite a cidade" setValue={value => handleInputChange('city', value)} value={address.city} disabled={isHidden} />

        <SelectField name="state" friendlyName="Estado" setSelectedValue={value => handleInputChange('uf', value)} selectedValue={address.uf} values={addressUFsWithId} disabled={isHidden} />
        
        <SelectField name="address_type" friendlyName="Tipo de endereço" setSelectedValue={value => handleInputChange('address_type', value)} selectedValue={address.address_type} values={AddressTypesWithId} disabled={isHidden} />

        {address.likeTax && <NumberField name="delivery_tax" friendlyName="Taxa de entrega" placeholder="Digite a taxa de entrega" setValue={value => handleInputChange('delivery_tax', value)} value={address.delivery_tax} />}
        
        <HiddenField name="object_id" setValue={value => handleInputChange('object_id', value)} value={address.object_id}/>
        <HiddenField name="id" setValue={value => handleInputChange('id', value)} value={address.id}/>
        </>
    );
};

export default AddressForm;