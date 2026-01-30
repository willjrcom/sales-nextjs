import { useEffect, useState } from 'react';
import { HiddenField, SelectField, TextField } from '../../components/modal/field';
import Address from '@/app/entities/address/address';
import { addressUFsWithId } from '@/app/entities/address/utils';
import PatternField from '@/app/components/modal/fields/pattern';
import { useSession } from 'next-auth/react';
import GetAddressByCEP from '@/app/api/busca-cep/busca-cep';
import { FaSearch } from 'react-icons/fa';
import GetCompany from '@/app/api/company/company';
import { useQuery } from '@tanstack/react-query';

export interface AddressFormProps {
    addressParent: Address;
    setAddressParent: React.Dispatch<React.SetStateAction<Address>>;
    isHidden?: boolean;
}

const AddressForm = ({ addressParent, setAddressParent, isHidden }: AddressFormProps) => {
    const [address, setAddress] = useState<Address>(new Address(addressParent));
    const { data } = useSession();

    const { data: company } = useQuery({
        queryKey: ['company'],
        queryFn: () => GetCompany(data!),
        enabled: !!data?.user?.access_token,
    })

    useEffect(() => {
        if (company?.address?.uf) {
            handleInputChange('uf', company.address.uf);
        }
    }, [company]);

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
                    {
                        ...address,
                        street: addressFound.logradouro,
                        neighborhood: addressFound.bairro,
                        city: addressFound.localidade,
                        uf: addressFound.uf
                    }
                ) as Address;
                setAddress(newAddress);
                setAddressParent(newAddress);

            }
        } catch (error) { }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                    <PatternField patternName='cep' name="cep" friendlyName="Cep" placeholder="Digite o cep" setValue={value => handleInputChange('cep', value)} value={address.cep} optional disabled={isHidden} formatted={true} />
                </div>
                <button
                    className='flex items-center justify-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md'
                    onClick={getAddress}
                >
                    <FaSearch />&nbsp;<span>Buscar</span>
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 sm:flex-[2] transform transition-transform duration-200 hover:scale-[1.01]">
                    <TextField name="street" friendlyName="Rua" placeholder="Digite sua rua" setValue={value => handleInputChange('street', value)} value={address.street} disabled={isHidden} />
                </div>
                <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                    <TextField name="number" friendlyName="Numero" placeholder="Digite o numero" setValue={value => handleInputChange('number', value)} value={address.number} disabled={isHidden} />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                    <TextField name="neighborhood" friendlyName="Bairro" placeholder="Digite o bairro" setValue={value => handleInputChange('neighborhood', value)} value={address.neighborhood} disabled={isHidden} />
                </div>
                <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                    <TextField name="complement" friendlyName="Complemento" placeholder="Digite o complemento" setValue={value => handleInputChange('complement', value)} value={address.complement} optional disabled={isHidden} />
                </div>
            </div>

            <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                <TextField name="reference" friendlyName="Referência" placeholder="Digite a referência" setValue={value => handleInputChange('reference', value)} value={address.reference} optional disabled={isHidden} />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 sm:flex-[2] transform transition-transform duration-200 hover:scale-[1.01]">
                    <TextField name="city" friendlyName="Cidade" placeholder="Digite a cidade" setValue={value => handleInputChange('city', value)} value={address.city} disabled={isHidden} />
                </div>
                <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                    <SelectField name="state" friendlyName="Estado" setSelectedValue={value => handleInputChange('uf', value)} selectedValue={address.uf} values={addressUFsWithId} disabled={isHidden} />
                </div>
            </div>

            <HiddenField name="object_id" setValue={value => handleInputChange('object_id', value)} value={address.object_id} />
            <HiddenField name="id" setValue={value => handleInputChange('id', value)} value={address.id} />
        </div>
    );
};

export default AddressForm;