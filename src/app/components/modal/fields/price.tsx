import { NumericFormat } from 'react-number-format';
import Decimal from 'decimal.js';

interface PriceFieldProps {
    friendlyName?: string;
    name: string;
    placeholder?: string;
    disabled?: boolean;
    value: Decimal.Value;
    setValue: (value: Decimal) => void;
    optional?: boolean;
}

const InputClassName = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline";

const PriceField = ({ friendlyName, name, disabled, value, setValue, placeholder, optional }: PriceFieldProps) => {
    return (
        <div className="mb-4">
            {friendlyName && (
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={friendlyName}>
                    {friendlyName} {!optional && <span className="text-red-500">*</span>}
                </label>
            )}

            <NumericFormat
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale={true} 
                allowNegative={false}
                id={name}
                name={name}
                disabled={disabled}
                value={new Decimal(value).toNumber()}
                onValueChange={(values) => setValue(new Decimal(values.floatValue || 0))}
                placeholder={placeholder}
                className={InputClassName}
            />
        </div>
    );
};

export default PriceField;
