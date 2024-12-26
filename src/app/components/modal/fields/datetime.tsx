import { Dispatch, SetStateAction } from "react";

interface DateTimeFieldProps {
    friendlyName: string;
    name: string;
    disabled?: boolean;
    value: string | null | undefined; // Permite null para valores não definidos
    setValue: Dispatch<SetStateAction<string | null | undefined>>;
    optional?: boolean;
}

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
                {friendlyName} {!optional && <span className="text-red-500">*</span>}
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
    )
}

export default DateTimeField
