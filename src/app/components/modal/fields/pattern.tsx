import { PatternFormat } from 'react-number-format';

interface PatternFieldProps {
    friendlyName?: string;
    name: string;
    placeholder?: string;
    disabled?: boolean;
    value: string;
    setValue: (value: string) => void;
    patternName: keyof typeof patterns;  // Definindo que patternName deve ser uma chave de 'patterns'
    optional?: boolean;
    /** If true, setValue will receive the formatted value including mask symbols; otherwise receives raw digits */
    formatted?: boolean;
}

// Tipando corretamente 'patterns' como um objeto, e não como um array
export const patterns = {
    "cpf": {
        pattern: "###.###.###-##",
        placeholder: "000.000.000-00"
    },
    "cnpj": {
        pattern: "##.###.###/####-##",
        placeholder: "00.000.000/0000-00"
    },
    "cep": {
        pattern: "#####-###",
        placeholder: "00000-000"
    },
    "ddd-phone": {
        pattern: "(##)",
        placeholder: "(00)"
    },
    "number-phone": {
        pattern: "#####-####",
        placeholder: "00000-0000"
    },
    "full-phone": {
        pattern: "(##) #####-####",
        placeholder: "(00) 00000-0000"
    }
} as const; // Garantindo que o objeto 'patterns' tem um formato de constante para os valores

const InputClassName = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline";

const PatternField = ({ friendlyName, name, disabled, value, setValue, patternName, optional, formatted = false }: PatternFieldProps) => {
    const { pattern, placeholder } = patterns[patternName];

    return (
        <div className="mb-4">
            {friendlyName && (
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={friendlyName}>
                    {friendlyName} {!optional && <span className="text-red-500">*</span>}
                </label>
            )}

            <PatternFormat
                format={pattern}
                id={name}
                name={name}
                disabled={disabled}
                value={value}
                onValueChange={({ value: raw, formattedValue }) =>
                    setValue(formatted ? formattedValue : raw)
                }
                placeholder={placeholder}
                className={InputClassName}
            />
        </div>
    );
};

export default PatternField;
