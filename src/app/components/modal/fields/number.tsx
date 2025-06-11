import { Dispatch, SetStateAction } from "react"

interface NumberFieldProps {
    friendlyName: string
    name: string
    placeholder?: string
    disabled?: boolean
    value?: number
    setValue: Dispatch<SetStateAction<number>>
    optional?: boolean;
    min?: number;
    max?: number
}

const InputClassName = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"

const NumberField = ({ friendlyName, name, placeholder, disabled, value, setValue, optional, min, max}: NumberFieldProps) => {
    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={friendlyName}>
                {friendlyName} {!optional && <span className="text-red-500">*</span>}
            </label>

            <input
                className={InputClassName}
                id={name}
                type="number"
                placeholder={placeholder}
                disabled={disabled}
                min={min}
                max={max}
                value={value === undefined || value === null || isNaN(value) ? '' : value}
                onChange={e => setValue(e.target.valueAsNumber)}
            />
        </div>
    )
}

export default NumberField 