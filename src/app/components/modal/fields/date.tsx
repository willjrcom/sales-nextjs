import { Dispatch, SetStateAction } from "react";

interface DateFieldProps {
    friendlyName: string;
    name: string;
    disabled?: boolean;
    value?: string | null | undefined; // Permitir undefined além de Date e null
    setValue: Dispatch<SetStateAction<string | null | undefined>>; // Continua permitindo null como valor inicial
    optional?: boolean;
}

const DateField = ({ friendlyName, name, disabled, setValue, value, optional}: DateFieldProps) => {
    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
                {friendlyName} {!optional && <span className="text-red-500">*</span>}
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

export default DateField