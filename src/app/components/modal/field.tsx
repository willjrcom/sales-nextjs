import { Dispatch, SetStateAction } from "react"

interface TextFieldProps {
    friendlyName?: string;
    name: string;
    placeholder?: string;
    disabled?: boolean;
    value: string;
    setValue: (value: string) => void;
    pattern?: string;
    optional?: boolean;
}

interface NumberFieldProps {
    friendlyName: string
    name: string
    placeholder?: string
    disabled?: boolean
    value?: number
    setValue: Dispatch<SetStateAction<number>>
    optional?: boolean;
}

interface DateFieldProps {
    friendlyName: string;
    name: string;
    disabled?: boolean;
    value?: string | null | undefined; // Permitir undefined além de Date e null
    setValue: Dispatch<SetStateAction<string | null | undefined>>; // Continua permitindo null como valor inicial
    optional?: boolean;
}

interface DateTimeFieldProps {
    friendlyName: string;
    name: string;
    disabled?: boolean;
    value: string | null | undefined; // Permite null para valores não definidos
    setValue: React.Dispatch<React.SetStateAction<string | null | undefined>>;
    optional?: boolean;
}

interface TimeFieldProps {
    friendlyName: string;
    name: string;
    disabled?: boolean;
    value?: string | null | undefined; // Permitir undefined além de string e null
    setValue: Dispatch<SetStateAction<string | null | undefined>>; // Continua permitindo null como valor inicial
    optional?: boolean;
}

interface CheckboxFieldProps {
    friendlyName: string
    name: string
    disabled?: boolean
    value?: boolean
    setValue: Dispatch<SetStateAction<boolean>>
    optional?: boolean;
}

interface RadioFieldProps {
    friendlyName: string;
    name: string;
    disabled?: boolean;
    values: Record<string, string>[];
    selectedValue: string;
    setSelectedValue: Dispatch<SetStateAction<string>>;
    optional?: boolean;
}

interface HiddenFieldProps {
    name: string
    value?: string
    setValue: Dispatch<SetStateAction<string>>
    optional?: boolean;
}

interface SelectFieldProps {
    friendlyName: string;
    name: string;
    disabled?: boolean;
    values: { id: string; name: string }[];
    selectedValue: string;
    setSelectedValue: (value: string) => void;
    optional?: boolean;
}

const InputClassName = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"

const TextField = ({ friendlyName, name, placeholder, disabled, value, setValue, pattern, optional}: TextFieldProps) => {
    return (
        <div className="mb-4">
            {friendlyName && (
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={friendlyName}>
                    {friendlyName} {optional && <span className="text-red-500">*</span>}
                </label>
            )}

            <input
                className={InputClassName}
                id={name}
                type="text"
                placeholder={placeholder}
                disabled={disabled}
                value={value}
                onChange={(e) => setValue(e.target.value)} // A função setValue agora aceita diretamente o valor
                pattern={pattern}
            />
        </div>
    );
};

const NumberField = ({ friendlyName, name, placeholder, disabled, value, setValue, optional}: NumberFieldProps) => {
    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={friendlyName}>
                {friendlyName} {optional && <span className="text-red-500">*</span>}
            </label>

            <input
                className={InputClassName}
                id={name}
                type="number"
                placeholder={placeholder}
                disabled={disabled}
                value={value}
                onChange={e => setValue(e.target.valueAsNumber)}
            />
        </div>
    )
}

const DateField = ({ friendlyName, name, disabled, setValue, value, optional}: DateFieldProps) => {
    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
                {friendlyName} {optional && <span className="text-red-500">*</span>}
            </label>

            <input
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                id={name}
                type="date"
                disabled={disabled}
                value={value ? new Date(value).toISOString().split('T')[0] : ""}
                onChange={e => setValue(e.target.value)}
            />
        </div>
    );
};

const DateTimeField = ({ friendlyName, name, disabled, setValue, value, optional}: DateTimeFieldProps) => {
    const formatDateTime = (date: string | null | undefined): string => {
        const newDate = date ? new Date(date) : null;
        // Verifica se o valor é um objeto Date válido
        if (!newDate || !(newDate instanceof Date) || isNaN(newDate.getTime())) return ""; 
        
        return newDate.toISOString().slice(0, 16); // Formata para YYYY-MM-DDTHH:mm
    };

    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
                {friendlyName} {optional && <span className="text-red-500">*</span>}
            </label>

            <input
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                id={name}
                type="datetime-local"
                disabled={disabled}
                value={formatDateTime(value)} // Formata o valor para o input
                onChange={(e) => setValue(e.target.value)}
            />
        </div>
    );
};

const TimeField = ({ friendlyName, name, disabled, setValue, value, optional}: TimeFieldProps) => {
    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
                {friendlyName} {optional && <span className="text-red-500">*</span>}
            </label>

            <input
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                id={name}
                type="time"
                disabled={disabled}
                value={value ? new Date(`1970-01-01T${value}Z`).toISOString().split('T')[1].slice(0, 5) : ""}
                onChange={e => setValue(e.target.value)}
            />
        </div>
    );
};

const CheckboxField = ({ friendlyName, name, disabled, value, setValue, optional}: CheckboxFieldProps) => {
    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
                {friendlyName} {optional && <span className="text-red-500">*</span>}
            </label>

            <input
                id={name}
                type="checkbox"
                disabled={disabled}
                checked={value} // Aqui você usa `checked` para indicar se o checkbox está marcado ou não
                onChange={e => setValue(e.target.checked)} // Usa `e.target.checked` que é um booleano
            />
        </div>
    );
};

const RadioField = ({ friendlyName, name, disabled, values, selectedValue, setSelectedValue, optional }: RadioFieldProps) => (
    <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
            {friendlyName} {optional && <span className="text-red-500">*</span>}
        </label>
        {values.length === 0 && <p className="text-gray-600">Nenhuma opção disponível</p>}
        {values.map((valueObj) => (
            <div key={valueObj.id} className="flex items-center mb-2">
                <input
                    id={valueObj.id}
                    type="radio"
                    name={name}
                    disabled={disabled}
                    value={valueObj.id}
                    checked={selectedValue === valueObj.id}
                    onChange={e => setSelectedValue(e.target.value)}
                    className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <label
                    htmlFor={valueObj.id}
                    className="ml-2 block text-gray-700 text-sm cursor-pointer"
                >
                    {valueObj.name}
                </label>
            </div>
        ))}
    </div>
);

const HiddenField = ({ name, value, setValue }: HiddenFieldProps) => {
    return (
        <input type='hidden' id={name} name={name} value={value} onChange={e => setValue(e.target.value)}></input>
    )
}

const SelectField = ({ friendlyName, name, disabled, values, selectedValue, setSelectedValue, optional }: SelectFieldProps) => (
    <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
            {friendlyName} {optional && <span className="text-red-500">*</span>}
        </label>
        {values.length === 0 && <p className="text-gray-600">Nenhuma opção disponível</p>}
        {values.length > 0 &&
            <select
                id={name}
                name={name}
                disabled={disabled}
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                className="form-select block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
                <option value="" disabled>Selecione uma opção</option>
                {values.map((valueObj) => (
                    <option key={valueObj.id} value={valueObj.id}>{valueObj.name}</option>
                ))}
            </select>
        }
    </div>
);

export { TextField, NumberField, DateField, DateTimeField, TimeField, CheckboxField, RadioField, HiddenField, SelectField }