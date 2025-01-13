import { Dispatch, SetStateAction } from "react";

interface CheckboxFieldProps {
    friendlyName: string;
    name: string;
    disabled?: boolean;
    value?: boolean;
    setValue: Dispatch<SetStateAction<boolean>>;
    optional?: boolean;
}

const CheckboxField = ({
    friendlyName,
    name,
    disabled,
    value = false,
    setValue,
    optional,
}: CheckboxFieldProps) => {
    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
                {friendlyName} {!optional && <span className="text-red-500">*</span>}
            </label>

            {/* Toggle Switch */}
            <div
                className={`relative inline-block w-12 h-6 ${
                    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={() => !disabled && setValue(!value)} // Altera o estado ao clicar
            >
                <input
                    id={name}
                    type="checkbox"
                    className="opacity-0 w-0 h-0"
                    checked={value}
                    disabled={disabled}
                    onChange={(e) => setValue(e.target.checked)}
                />
                {/* Fundo do toggle */}
                <span
                    className={`absolute top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-300 ${
                        value ? "bg-blue-500" : "bg-gray-300"
                    }`}
                ></span>
                {/* Botão do toggle */}
                <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                        value ? "transform translate-x-6" : ""
                    }`}
                ></span>
            </div>
        </div>
    );
};

export default CheckboxField;
