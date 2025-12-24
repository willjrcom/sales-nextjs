import { useEffect } from 'react';
import { HiddenField, SelectField, TextField } from '../../components/modal/field';
import PriceField from '@/app/components/modal/fields/price';
import { addressUFsWithId, AddressTypesWithId } from '@/app/entities/address/utils';
import PatternField from '@/app/components/modal/fields/pattern';
import { useSession } from 'next-auth/react';
import GetAddressByCEP from '@/app/api/busca-cep/busca-cep';
import { FaSearch } from 'react-icons/fa';
import GetCompany from '@/app/api/company/company';
import { useFormContext, Controller } from 'react-hook-form';

interface AddressClientFormProps {
    prefix?: string;
}

const AddressClientForm = ({ prefix = 'address' }: AddressClientFormProps) => {
    const { control, formState: { errors }, watch, setValue } = useFormContext();
    const { data } = useSession();

    const getFieldName = (field: string) => `${prefix}.${field}`;
    const getError = (field: string) => {
        const prefixErrors = errors[prefix] as Record<string, { message?: string }> | undefined;
        return prefixErrors?.[field]?.message;
    };

    const cep = watch(getFieldName('cep'));
    const uf = watch(getFieldName('uf'));

    useEffect(() => {
        getUfFromCompany();
    }, [data]);

    const getUfFromCompany = async () => {
        if (uf || !data) return;

        const company = await GetCompany(data);
        if (!company) return;

        const companyAddress = company.address;
        if (!companyAddress) return;

        setValue(getFieldName('uf'), companyAddress.uf);
    };

    const getAddress = async () => {
        try {
            const addressFound = await GetAddressByCEP(cep);

            if (addressFound.cep.replace("-", "") === cep.replace("-", "")) {
                setValue(getFieldName('street'), addressFound.logradouro);
                setValue(getFieldName('neighborhood'), addressFound.bairro);
                setValue(getFieldName('city'), addressFound.localidade);
                setValue(getFieldName('uf'), addressFound.uf);
            }
        } catch (error) { }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                    <Controller
                        name={getFieldName('cep')}
                        control={control}
                        render={({ field }) => (
                            <PatternField
                                patternName='cep'
                                name="cep"
                                friendlyName="Cep"
                                placeholder="Digite o cep"
                                setValue={field.onChange}
                                value={field.value || ''}
                                optional
                                formatted={true}
                                error={getError('cep')}
                            />
                        )}
                    />
                </div>
                <button
                    type="button"
                    className='flex items-center justify-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md'
                    onClick={getAddress}
                >
                    <FaSearch />&nbsp;<span>Buscar</span>
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 sm:flex-[2] transform transition-transform duration-200 hover:scale-[1.01]">
                    <Controller
                        name={getFieldName('street')}
                        control={control}
                        render={({ field }) => (
                            <TextField
                                name="street"
                                friendlyName="Rua"
                                placeholder="Digite sua rua"
                                setValue={field.onChange}
                                value={field.value || ''}
                                error={getError('street')}
                            />
                        )}
                    />
                </div>
                <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                    <Controller
                        name={getFieldName('number')}
                        control={control}
                        render={({ field }) => (
                            <TextField
                                name="number"
                                friendlyName="Numero"
                                placeholder="Digite o numero"
                                setValue={field.onChange}
                                value={field.value || ''}
                                error={getError('number')}
                            />
                        )}
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                    <Controller
                        name={getFieldName('neighborhood')}
                        control={control}
                        render={({ field }) => (
                            <TextField
                                name="neighborhood"
                                friendlyName="Bairro"
                                placeholder="Digite o bairro"
                                setValue={field.onChange}
                                value={field.value || ''}
                                error={getError('neighborhood')}
                            />
                        )}
                    />
                </div>
                <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                    <Controller
                        name={getFieldName('complement')}
                        control={control}
                        render={({ field }) => (
                            <TextField
                                name="complement"
                                friendlyName="Complemento"
                                placeholder="Digite o complemento"
                                setValue={field.onChange}
                                value={field.value || ''}
                                optional
                                error={getError('complement')}
                            />
                        )}
                    />
                </div>
            </div>

            <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                <Controller
                    name={getFieldName('reference')}
                    control={control}
                    render={({ field }) => (
                        <TextField
                            name="reference"
                            friendlyName="Referência"
                            placeholder="Digite a referência"
                            setValue={field.onChange}
                            value={field.value || ''}
                            optional
                            error={getError('reference')}
                        />
                    )}
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 sm:flex-[2] transform transition-transform duration-200 hover:scale-[1.01]">
                    <Controller
                        name={getFieldName('city')}
                        control={control}
                        render={({ field }) => (
                            <TextField
                                name="city"
                                friendlyName="Cidade"
                                placeholder="Digite a cidade"
                                setValue={field.onChange}
                                value={field.value || ''}
                                error={getError('city')}
                            />
                        )}
                    />
                </div>
                <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                    <Controller
                        name={getFieldName('uf')}
                        control={control}
                        render={({ field }) => (
                            <SelectField
                                name="state"
                                friendlyName="Estado"
                                setSelectedValue={field.onChange}
                                selectedValue={field.value || ''}
                                values={addressUFsWithId}
                            />
                        )}
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                    <Controller
                        name={getFieldName('address_type')}
                        control={control}
                        render={({ field }) => (
                            <SelectField
                                name="address_type"
                                friendlyName="Tipo de endereço"
                                setSelectedValue={field.onChange}
                                selectedValue={field.value || ''}
                                values={AddressTypesWithId}
                            />
                        )}
                    />
                </div>
                <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                    <Controller
                        name={getFieldName('delivery_tax')}
                        control={control}
                        render={({ field }) => (
                            <PriceField
                                name="delivery_tax"
                                friendlyName="Taxa de entrega"
                                placeholder="Digite a taxa de entrega"
                                setValue={field.onChange}
                                value={field.value || 0}
                            />
                        )}
                    />
                </div>
            </div>

            <Controller
                name={getFieldName('object_id')}
                control={control}
                render={({ field }) => (
                    <HiddenField name="object_id" setValue={field.onChange} value={field.value || ''} />
                )}
            />
            <Controller
                name={getFieldName('id')}
                control={control}
                render={({ field }) => (
                    <HiddenField name="id" setValue={field.onChange} value={field.value || ''} />
                )}
            />
        </div>
    );
};

export default AddressClientForm;