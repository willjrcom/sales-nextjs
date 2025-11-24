import React from 'react';
import PatternField, { patterns } from './fields/pattern';

interface FormArrayProps {
    title: string;
    singleItemName: string;
    items: string[];
    patternName: keyof typeof patterns;
    onAdd: () => void;
    onRemove: (index: number) => void;
    onChange: (index: number, value: string) => void;
}

const FormArrayPattern = ({ title, singleItemName, items, patternName, onAdd, onRemove, onChange }: FormArrayProps) => {
    // Garantir que items seja sempre um array
    const safeItems = Array.isArray(items) ? items : [];
    
    return (
        <div className="space-y-4">
            <h3 className="text-md font-semibold">{title}</h3>
            {safeItems.length === 0 ? (
                <div className='flex justify-end'>
                    <button
                        type="button"
                        className="text-blue-500"
                        onClick={onAdd}
                    >
                        Adicionar {singleItemName}
                    </button>
                </div>
            ) : (
                <>
                    <div className="space-y-2 grid grid-cols-2">
                        {safeItems.map((item, index) => (
                            <div key={index} className="flex items-center space-x-4">
                                <PatternField
                                    patternName={patternName}
                                    friendlyName={`${singleItemName} ${index + 1}`}
                                    name={`${singleItemName}-${index}`}
                                    value={item}
                                    setValue={(value) => onChange(index, value)}
                                    formatted={true}
                                />
                                <button
                                    type="button"
                                    className="text-red-500"
                                    onClick={() => onRemove(index)}
                                >
                                    Remover
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className='flex justify-end'>
                        <button
                            type="button"
                            className="mt-4 text-blue-500"
                            onClick={onAdd}
                        >
                            Adicionar
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default FormArrayPattern;
