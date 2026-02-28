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

const SelectField = ({ friendlyName, name, disabled, values, selectedValue, setSelectedValue, optional, removeDefaultOption, error }: SelectFieldProps) => {
    // Check if the selected value is present in the provided values list
    const isSelectedInValues = values.some(v => v.id === selectedValue);

    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
                {friendlyName} {!optional && <span className="text-red-500">*</span>}
            </label>

            {/* If there are no values AND no selected value, show message */}
            {values.length === 0 && !selectedValue && <p className="text-gray-600">Nenhuma opção disponível</p>}

            {/* Show select if there are values OR if there's a selected value (even if not in list) */}
            {(values.length > 0 || selectedValue) && (
                <select
                    id={name}
                    name={name}
                    disabled={disabled}
                    value={selectedValue}
                    onChange={(e) => setSelectedValue(e.target.value)}
                    className={`form-select block w-full px-3 py-2 text-gray-700 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm cursor-pointer`}
                >
                    {!removeDefaultOption && <option value="">Selecione um {friendlyName}</option>}

                    {/* If selected value is NOT in the list, render it anyway so it stays visible */}
                    {selectedValue && !isSelectedInValues && (
                        <option value={selectedValue}>{selectedValue}</option>
                    )}

                    {values.map((valueObj) => (
                        <option key={valueObj.id} value={valueObj.id}>{valueObj.name}</option>
                    ))}
                </select>
            )}
            {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
        </div>
    );
};

export default SelectField 