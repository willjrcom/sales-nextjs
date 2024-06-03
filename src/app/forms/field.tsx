import { Dispatch, SetStateAction } from "react"

interface TextFieldProps {
    friendlyName: string
    name: string
    placeholder?: string
    disabled?: boolean
    value?: string
    setValue: Dispatch<SetStateAction<string>>
}

interface NumberFieldProps {
    friendlyName: string
    name: string
    placeholder?: string
    disabled?: boolean
    value?: number
    setValue: Dispatch<SetStateAction<number>>
}

interface DateFieldProps {
    friendlyName: string
    name: string
    disabled?: boolean
    value: string
    setValue: Dispatch<SetStateAction<string>>
}

interface CheckboxFieldProps {
    friendlyName: string
    name: string
    placeholder?: string
    disabled?: boolean
    value?: string
    setValue: Dispatch<SetStateAction<boolean>>
}

interface HiddenFieldProps {
    name: string
    value?: string
    setValue: Dispatch<SetStateAction<string>>
}

const InputClassName = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"

const TextField = ({ friendlyName, name, placeholder, disabled, value, setValue }: TextFieldProps) => {

    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={friendlyName}>
                {friendlyName}
            </label>

            <input
                className={InputClassName}
                id={name}
                type="text"
                placeholder={placeholder}
                disabled={disabled}
                value={value}
                onChange={e => setValue(e.target.value)}
            />
        </div>
    )
}

const NumberField = ({ friendlyName, name, placeholder, disabled, value, setValue }: NumberFieldProps) => {

    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={friendlyName}>
                {friendlyName}
            </label>

            <input
                className={InputClassName}
                id={name}
                type="number"
                placeholder={placeholder}
                disabled={disabled}
                value={value}
                onChange={e => setValue(Number(e.target.value))}
            />
        </div>
    )
}

const DateField = ({ friendlyName, name, disabled, setValue, value }: DateFieldProps) => {

    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={friendlyName}>
                {friendlyName}
            </label>

            <input
                className={InputClassName}
                id={name}
                type="date"
                disabled={disabled}
                value={value}
                onChange={e => setValue(e.target.value)}
            />
        </div>
    )
}

const CheckboxField = ({ friendlyName, name, placeholder, disabled, value, setValue }: CheckboxFieldProps) => {

    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={friendlyName}>
                {friendlyName}
            </label>

            <input
                id={name}
                type="checkbox"
                placeholder={placeholder}
                disabled={disabled}
                value={value}
                onChange={e => setValue(Boolean(e.target.value))}
            />
        </div>
    )
}

const HiddenField = ({ name, value, setValue }: HiddenFieldProps) => {
    return (
        <input type='hidden' id={name} name={name} value={value} onChange={e => setValue(e.target.value)}></input>
    )
}

export { TextField, NumberField, DateField, CheckboxField, HiddenField }