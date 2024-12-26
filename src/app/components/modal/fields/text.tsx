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

const InputClassName = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"

const TextField = ({ friendlyName, name, placeholder, disabled, value, setValue, pattern, optional}: TextFieldProps) => {
    return (
        <div className="mb-4">
            {friendlyName && (
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={friendlyName}>
                    {friendlyName} {!optional && <span className="text-red-500">*</span>}
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
export default TextField