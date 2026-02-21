import React, { useMemo, useState } from 'react';
import DeliveryDriver from '@/app/entities/delivery-driver/delivery-driver';
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { useSession } from 'next-auth/react';
import ButtonsModal from '../../components/modal/buttons-modal';
import CreateFormsProps from '../create-forms-props';
import DeleteDeliveryDriver from '@/app/api/delivery-driver/delete/delivery-driver';
import NewDeliveryDriver from '@/app/api/delivery-driver/new/delivery-driver';
import UpdateDeliveryDriver from '@/app/api/delivery-driver/update/delivery-driver';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/utils/error';
import { SelectField, CheckboxField } from '@/app/components/modal/field';
import Employee from '@/app/entities/employee/employee';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GetEmployeesWithoutDeliveryDrivers } from '@/app/api/employee/employee';

const DeliveryDriverForm = ({ item, isUpdate }: CreateFormsProps<DeliveryDriver>) => {
    const modalName = isUpdate ? 'edit-delivery-driver-' + item?.id : 'new-delivery-driver'
    const modalHandler = useModal();
    const queryClient = useQueryClient();
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(item?.employee_id || "");
    const [deliveryDriver, setDeliveryDriver] = useState<DeliveryDriver>(new DeliveryDriver(item));
    const { data } = useSession();
    const [isSaving, setIsSaving] = useState(false);

    const { data: employeesWithoutDriversResponse } = useQuery({
        queryKey: ['employees-without-delivery-drivers'],
        queryFn: () => GetEmployeesWithoutDeliveryDrivers(data!, 0, 1000),
        enabled: !!data?.user?.access_token,
    });

    const employeesWithoutDrivers = useMemo(() => employeesWithoutDriversResponse?.items || [], [employeesWithoutDriversResponse?.items]);
    const selectedEmployee = useMemo(() => employeesWithoutDrivers.find(employee => employee.id === selectedEmployeeId), [employeesWithoutDrivers, selectedEmployeeId]);

    const submit = async () => {
        if (!data) return;
        if (!isUpdate && !selectedEmployee) {
            notifyError('Selecione um motoboy');
            return
        }
        setIsSaving(true);
        try {
            deliveryDriver.employee_id = selectedEmployeeId
            const response = isUpdate ? await UpdateDeliveryDriver(deliveryDriver, data) : await NewDeliveryDriver(deliveryDriver.employee_id, data)

            if (!isUpdate) {
                deliveryDriver.employee = selectedEmployee || new Employee();
            }

            if (!isUpdate) {
                deliveryDriver.id = response
                notifySuccess(`Motoboy ${deliveryDriver.employee.name} adicionado com sucesso`);
            } else {
                notifySuccess(`Motoboy ${deliveryDriver.employee.name} atualizado com sucesso`);
            }

            queryClient.invalidateQueries({ queryKey: ['delivery-drivers'] });
            queryClient.invalidateQueries({ queryKey: ['employees-without-delivery-drivers'] });
            modalHandler.hideModal(modalName);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao salvar motoboy');
        } finally {
            setIsSaving(false);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        setIsSaving(true);
        try {
            await DeleteDeliveryDriver(deliveryDriver.id, data);
            notifySuccess(`Motoboy ${deliveryDriver.employee.name} removido com sucesso`);
            queryClient.invalidateQueries({ queryKey: ['delivery-drivers'] });
            modalHandler.hideModal(modalName);
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Erro ao remover motoboy');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="text-black space-y-6">
            {!isUpdate && (
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 transition-all duration-300 hover:shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-blue-200">Selecionar Motoboy</h3>
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <SelectField friendlyName='Motoboy' name='name' setSelectedValue={setSelectedEmployeeId} selectedValue={selectedEmployeeId} values={employeesWithoutDrivers} />
                    </div>
                </div>
            )}
            {isUpdate && (
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Gerenciar Motoboy</h3>
                    <div className="transform transition-transform duration-200 hover:scale-[1.01]">
                        <CheckboxField friendlyName='Ativo' name='is_active' setValue={value => setDeliveryDriver(prev => ({ ...prev, is_active: typeof value === 'function' ? value(prev.is_active) : value }))} value={deliveryDriver.is_active} />
                    </div>
                </div>
            )}
            {isUpdate && <ButtonsModal item={deliveryDriver.employee} name="Motoboy" onSubmit={submit} deleteItem={onDelete} isPending={isSaving} />}
            {!isUpdate && <ButtonsModal item={deliveryDriver} name="Motoboy" onSubmit={submit} isPending={isSaving} />}
        </div>
    );
};

export default DeliveryDriverForm;