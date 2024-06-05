import { Dispatch, SetStateAction } from "react"

interface TextFieldProps {
    friendlyName: string
    name: string
    placeholder?: string
    disabled?: boolean
    value?: string
    setValue: Dispatch<SetStateAction<string>>
    pattern?: string
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

interface RadioFieldProps {
    friendlyName: string;
    name: string;
    disabled?: boolean;
    values: Record<string, string>[];
    selectedValue: string;
    setSelectedValue: Dispatch<SetStateAction<string>>;
}

interface HiddenFieldProps {
    name: string
    value?: string
    setValue: Dispatch<SetStateAction<string>>
}

const InputClassName = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"

const TextField = ({ friendlyName, name, placeholder, disabled, value, setValue, pattern }: TextFieldProps) => {

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
                onChange={e => setValue(e.target.value.replace(pattern!, ""))}
                pattern={pattern}
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

const RadioField = ({ friendlyName, name, disabled, values, selectedValue, setSelectedValue }: RadioFieldProps) => (
    <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
            {friendlyName}
        </label>
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

export { TextField, NumberField, DateField, CheckboxField, RadioField, HiddenField }