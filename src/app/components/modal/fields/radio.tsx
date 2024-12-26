import { Dispatch, SetStateAction } from "react";

interface RadioFieldProps {
    friendlyName: string;
    name: string;
    disabled?: boolean;
    values: Record<string, string>[];
    selectedValue: string;
    setSelectedValue: Dispatch<SetStateAction<string>>;
    optional?: boolean;
}

const RadioField = ({ friendlyName, name, disabled, values, selectedValue, setSelectedValue, optional }: RadioFieldProps) => (
    <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
            {friendlyName} {!optional && <span className="text-red-500">*</span>}
        </label>
        {values.length === 0 && <p className="text-gray-600">Nenhuma opção disponível</p>}
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

export default RadioField