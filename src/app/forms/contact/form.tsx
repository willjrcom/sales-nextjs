import { Dispatch, SetStateAction } from 'react';
import Contact from '@/app/entities/contact/contact';
import PatternField from '@/app/components/modal/fields/pattern';

interface ContactFormProps {
    contactParent: Contact;
    setContactParent: Dispatch<SetStateAction<Contact>>;
    isHidden?: boolean;
}

const ContactForm = ({ contactParent, setContactParent, isHidden }: ContactFormProps) => {
    // Função para atualizar o estado do contato no componente pai
    const handleInputChange = (field: keyof Contact, value: any) => {
        setContactParent(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                <PatternField
                    patternName='ddd-phone'
                    name="ddd-phone"
                    friendlyName="DDD"
                    placeholder="(xx)"
                    setValue={value => handleInputChange('ddd', value)}
                    value={contactParent.ddd}
                    disabled={isHidden}
                />
            </div>
            <div className="flex-1 sm:flex-[2] transform transition-transform duration-200 hover:scale-[1.01]">
                <PatternField
                    patternName='number-phone'
                    name="number-phone"
                    friendlyName="Contato"
                    placeholder="x xxxx-xxxx"
                    setValue={value => handleInputChange('number', value)}
                    value={contactParent.number}
                    disabled={isHidden}
                />
            </div>
        </div>
    );
};

export default ContactForm;
