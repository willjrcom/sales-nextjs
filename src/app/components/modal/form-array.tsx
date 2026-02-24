import React from 'react';
import { TextField } from '@/app/components/modal/field';
import { Trash2, Plus } from 'lucide-react';

interface FormArrayProps {
    title: string;
    singleItemName: string;
    items: string[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onChange: (index: number, value: string) => void;
}

const FormArray = ({ title, singleItemName, items, onAdd, onRemove, onChange }: FormArrayProps) => {
    return (
        <div className="space-y-4">
            <div className='flex justify-between items-center'>
                <h3 className="text-md font-semibold">{title}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items?.map((item, index) => (
                    <div key={index} className="flex items-end space-x-2 bg-gray-50/50 p-3 rounded-lg border border-gray-100 relative group">
                        <div className="flex-1">
                            <TextField
                                friendlyName={`${singleItemName} ${index + 1}`}
                                name={`${singleItemName}-${index}`}
                                value={item}
                                setValue={(value) => onChange(index, value)}
                            />
                        </div>
                        <button
                            type="button"
                            className="mb-4 p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            onClick={() => onRemove(index)}
                            title={`Remover ${singleItemName}`}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className='flex justify-end mt-2'>
                <button
                    type="button"
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-md transition-colors"
                    onClick={onAdd}
                >
                    <Plus className="w-4 h-4" />
                    Adicionar {singleItemName}
                </button>
            </div>
        </div>
    );
};

export default FormArray;
