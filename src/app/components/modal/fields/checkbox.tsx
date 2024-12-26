import { Dispatch, SetStateAction } from "react"

interface CheckboxFieldProps {
    friendlyName: string
    name: string
    disabled?: boolean
    value?: boolean
    setValue: Dispatch<SetStateAction<boolean>>
    optional?: boolean;
}

const CheckboxField = ({ friendlyName, name, disabled, value, setValue, optional}: CheckboxFieldProps) => {
    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
                {friendlyName} {!optional && <span className="text-red-500">*</span>}
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

export default CheckboxField