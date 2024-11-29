import { Dispatch, SetStateAction } from 'react';
import { TextField } from '../../components/modal/field';
import Contact from '@/app/entities/contact/contact';

interface ContactFormProps {
    contactParent: Contact;
    setContactParent: Dispatch<SetStateAction<Contact>>;
}

const ContactForm = ({ contactParent, setContactParent }: ContactFormProps) => {

    // Função para atualizar o estado do contato no componente pai
    const handleInputChange = (field: keyof Contact, value: any) => {
        setContactParent(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="flex space-x-4">
            <div className="w-1/3">
                <TextField
                    name="ddd"
                    friendlyName="DDD"
                    placeholder="(xx)"
                    setValue={value => handleInputChange('ddd', value)}  // Atualizando o estado no componente pai
                    value={contactParent.ddd}  // Usando o estado diretamente do componente pai
                />
            </div>
            <div className="w-2/3">
                <TextField
                    name="number"
                    friendlyName="Contato"
                    placeholder="x xxxx-xxxx"
                    setValue={value => handleInputChange('number', value)}  // Atualizando o estado no componente pai
                    value={contactParent.number}  // Usando o estado diretamente do componente pai
                />
            </div>
        </div>
    );
};

export default ContactForm;
