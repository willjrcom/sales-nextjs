import { Dispatch, SetStateAction } from "react";

interface TimeFieldProps {
    friendlyName: string;
    name: string;
    disabled?: boolean;
    value?: string | null | undefined; // Permitir undefined além de string e null
    setValue: ((value: string | null | undefined) => void) | Dispatch<SetStateAction<string | null | undefined>>; // Continua permitindo null como valor inicial
    optional?: boolean;
    error?: string;
}

const TimeField = ({ friendlyName, name, disabled, setValue, value, optional, error }: TimeFieldProps) => {
    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
                {friendlyName} {!optional && <span className="text-red-500">*</span>}
            </label>

            <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${error ? 'border-red-500 text-red-600' : 'border-gray-300 text-gray-700'}`}
                id={name}
                type="text"
                placeholder="00:00"
                disabled={disabled}
                value={value || ""}
                onChange={e => setValue(e.target.value)}
            />
            {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
        </div>
    );
};

export default TimeField