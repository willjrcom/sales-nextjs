interface SelectFieldProps {
    friendlyName: string;
    name: string;
    disabled?: boolean;
    values: { id: string; name: string }[];
    selectedValue: string;
    setSelectedValue: (value: string) => void;
    optional?: boolean;
    removeDefaultOption?: boolean;
    error?: string;
}

const SelectField = ({ friendlyName, name, disabled, values, selectedValue, setSelectedValue, optional, removeDefaultOption, error }: SelectFieldProps) => (
    <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
            {friendlyName} {!optional && <span className="text-red-500">*</span>}
        </label>
        {values.length === 0 && <p className="text-gray-600">Nenhuma opção disponível</p>}
        {values.length > 0 &&
            <select
                id={name}
                name={name}
                disabled={disabled}
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                className={`form-select block w-full px-3 py-2 text-gray-700 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm cursor-pointer`}
            >
                {!removeDefaultOption && <option value="">Selecione um {friendlyName}</option>}
                {values.map((valueObj) => (
                    <option key={valueObj.id} value={valueObj.id}>{valueObj.name}</option>
                ))}
            </select>
        }
        {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
    </div>
);

export default SelectField 