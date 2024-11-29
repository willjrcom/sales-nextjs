import React from 'react';
import { TextField } from '../../components/modal/field';
import Contact from '@/app/entities/contact/contact';

interface ContactFormProps {
    contact: Contact;
    setContact: React.Dispatch<React.SetStateAction<Contact>>;
}

const ContactForm = ({ contact, setContact }: ContactFormProps) => {
    const handleInputChange = (field: keyof Contact, value: any) => {
        setContact(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="flex space-x-4">
            <div className="w-1/3">
                <TextField name="ddd" friendlyName="DDD" placeholder="(xx)" setValue={value => handleInputChange('ddd', value)} value={contact.ddd} />
            </div>
            <div className="w-2/3">
                <TextField name="number" friendlyName="Contato" placeholder="x xxxx-xxxx" setValue={value => handleInputChange('number', value)} value={contact.number} />
            </div>
        </div>
    );
};

export default ContactForm;