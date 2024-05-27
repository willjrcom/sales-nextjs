import Link from 'next/link';
import React from 'react';

interface ModalProps {
    title: string;
    show: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const FilterForm = ({ title, show, onClose, children }: ModalProps) => {
    if (!show) return null;

    return (
        <div className="max-w-md mx-auto mt-10">
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h2>Filtrar {title}</h2>
                {children}

                <div className="flex items-center justify-between">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="button">Filtrar</button>

                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={onClose}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default FilterForm;