import React from 'react';
import ButtonsModal from '../../components/modal/buttons-modal';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import UpdateTableOrderName from '@/app/api/order-table/update/name/[id]/order-table';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { TextField } from '@/app/components/modal/field';
import OrderTable, { SchemaUpdateTableName, UpdateTableNameFormData } from '@/app/entities/order/order-table';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface TableNameFormProps extends CreateFormsProps<OrderTable> {
    tableOrderId?: string;
}

const TableNameForm = ({ item, tableOrderId }: TableNameFormProps) => {
    const modalName = 'edit-table-order-name-' + item?.id;
    const modalHandler = useModal();
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<UpdateTableNameFormData>({
        resolver: zodResolver(SchemaUpdateTableName),
        defaultValues: {
            name: item?.name || '',
        }
    });

    const updateNameMutation = useMutation({
        mutationFn: (newName: string) => UpdateTableOrderName(tableOrderId!, newName, session!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['order'] });
            queryClient.invalidateQueries({ queryKey: ['table-orders'] });
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

    const onSubmit = (formData: UpdateTableNameFormData) => {
        if (!session || !tableOrderId) return;
        updateNameMutation.mutate(formData.name);
    }

    return (
        <>
            <TextField
                name='name'
                friendlyName='Nome do cliente'
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

export default TableNameForm;
