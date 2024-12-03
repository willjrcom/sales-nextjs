import React from 'react';
import { TextField } from '@/app/components/modal/field';

interface ContactsFormArrayProps {
    contacts: string[];
    onAddContact: () => void;
    onRemoveContact: (index: number) => void;
    onContactChange: (index: number, value: string) => void;
}

const ContactsFormArray = ({ contacts, onAddContact, onRemoveContact, onContactChange }: ContactsFormArrayProps) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contatos</h3>
            <div className="space-y-2 grid grid-cols-2">
                {contacts.map((contact, index) => (
                    <div key={index} className="flex items-center space-x-4">
                        <TextField
                            friendlyName={`Contato ${index + 1}`}
                            name={`contact-${index}`}
                            value={contact}
                            setValue={(value) => onContactChange(index, value)} // Passando o valor diretamente para onContactChange
                        />
                        <button
                            type="button"
                            className="text-red-500"
                            onClick={() => onRemoveContact(index)}
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
                    onClick={onAddContact}
                >
                    Adicionar Contato
                </button>
            </div>
        </div>
    );
};

export default ContactsFormArray;
