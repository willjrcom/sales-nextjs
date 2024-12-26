import { Dispatch, SetStateAction } from "react";

interface TimeFieldProps {
    friendlyName: string;
    name: string;
    disabled?: boolean;
    value?: string | null | undefined; // Permitir undefined além de string e null
    setValue: Dispatch<SetStateAction<string | null | undefined>>; // Continua permitindo null como valor inicial
    optional?: boolean;
}

const TimeField = ({ friendlyName, name, disabled, setValue, value, optional }: TimeFieldProps) => {
    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
                {friendlyName} {!optional && <span className="text-red-500">*</span>}
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

export default TimeField