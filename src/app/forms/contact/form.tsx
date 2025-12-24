import PatternField from '@/app/components/modal/fields/pattern';
import { useFormContext, Controller } from 'react-hook-form';

interface ContactFormProps {
    prefix?: string;
    isHidden?: boolean;
}

const ContactForm = ({ prefix = 'contact', isHidden }: ContactFormProps) => {
    const { control, formState: { errors } } = useFormContext();

    const getFieldName = (field: string) => `${prefix}.${field}`;
    const getError = (field: string) => {
        const prefixErrors = errors[prefix] as Record<string, { message?: string }> | undefined;
        return prefixErrors?.[field]?.message;
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 transform transition-transform duration-200 hover:scale-[1.01]">
                <Controller
                    name={getFieldName('ddd')}
                    control={control}
                    render={({ field }) => (
                        <PatternField
                            patternName='ddd-phone'
                            name="ddd-phone"
                            friendlyName="DDD"
                            placeholder="(xx)"
                            setValue={field.onChange}
                            value={field.value || ''}
                            disabled={isHidden}
                            error={getError('ddd')}
                        />
                    )}
                />
            </div>
            <div className="flex-1 sm:flex-[2] transform transition-transform duration-200 hover:scale-[1.01]">
                <Controller
                    name={getFieldName('number')}
                    control={control}
                    render={({ field }) => (
                        <PatternField
                            patternName='number-phone'
                            name="number-phone"
                            friendlyName="Contato"
                            placeholder="x xxxx-xxxx"
                            setValue={field.onChange}
                            value={field.value || ''}
                            disabled={isHidden}
                            error={getError('number')}
                        />
                    )}
                />
            </div>
        </div>
    );
};

export default ContactForm;
