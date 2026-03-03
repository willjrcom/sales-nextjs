import React from 'react';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import UpdatePickupOrderName from '@/app/api/order-pickup/update/name/[id]/order-pickup';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { TextField } from '@/app/components/modal/field';
import OrderPickup, { SchemaUpdatePickupName, UpdatePickupNameFormData } from '@/app/entities/order/order-pickup';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface PickupNameFormProps extends CreateFormsProps<OrderPickup> {
    pickupOrderId?: string;
}

const PickupNameForm = ({ item, pickupOrderId }: PickupNameFormProps) => {
    const modalName = 'edit-pickup-order-name-' + item?.id;
    const modalHandler = useModal();
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<UpdatePickupNameFormData>({
        resolver: zodResolver(SchemaUpdatePickupName),
        defaultValues: {
            name: item?.name || '',
        }
    });

    const updateNameMutation = useMutation({
        mutationFn: (newName: string) => UpdatePickupOrderName(pickupOrderId!, newName, session!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['order'] });
            notifySuccess('Nome atualizado com sucesso');
            modalHandler.hideModal(modalName);
        },
        onError: (error: RequestError) => {
            notifyError(error.message || 'Erro ao atualizar nome');
        }
    });

    const onInvalid = () => {
        console.log(errors);
        notifyError('Verifique os campos obrigatórios');
    };

    const onSubmit = (formData: UpdatePickupNameFormData) => {
        if (!session || !pickupOrderId) return;
        updateNameMutation.mutate(formData.name);
    }

    return (
        <>
            <TextField
                name='name'
                friendlyName='Nome'
                placeholder='Digite o nome'
                setValue={(value: any) => setValue('name', value)}
                value={watch('name')}
                error={errors.name?.message}
            />
            <ButtonsModal
                item={item!}
                name='Atualizar nome'
                onSubmit={handleSubmit(onSubmit, onInvalid)}
                isPending={updateNameMutation.isPending || isSubmitting}
            />
        </>
    );

};

export default PickupNameForm;