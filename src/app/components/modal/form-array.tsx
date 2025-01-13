import React from 'react';
import { TextField } from '@/app/components/modal/field';

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
            <h3 className="text-md font-semibold">{title}</h3>
            <div className="space-y-2 grid grid-cols-2">
                {items?.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                        <TextField
                            friendlyName={`${singleItemName} ${index + 1}`}
                            name={`${singleItemName}-${index}`}
                            value={item}
                            setValue={(value) => onChange(index, value)}
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
        </div>
    );
};

export default FormArray;
