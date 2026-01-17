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
import GetEmployees from '@/app/api/employee/employee';
import GetDeliveryDrivers from '@/app/api/delivery-driver/delivery-driver';

const DeliveryDriverForm = ({ item, isUpdate }: CreateFormsProps<DeliveryDriver>) => {
    const modalName = isUpdate ? 'edit-delivery-driver-' + item?.id : 'new-delivery-driver'
    const modalHandler = useModal();
    const queryClient = useQueryClient();
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
    const [deliveryDriver, setDeliveryDriver] = useState<DeliveryDriver>(item || new DeliveryDriver());
    const { data } = useSession();

    const { data: employeesResponse } = useQuery({
        queryKey: ['employees'],
        queryFn: () => GetEmployees(data!),
        enabled: !!data?.user?.access_token,
    });

    const { data: deliveryDriversResponse } = useQuery({
        queryKey: ['delivery-drivers'],
        queryFn: () => GetDeliveryDrivers(data!),
        enabled: !!data?.user?.access_token,
    });

    const employees = useMemo(() => employeesResponse?.items || [], [employeesResponse?.items]);
    const drivers = useMemo(() => deliveryDriversResponse?.items || [], [deliveryDriversResponse?.items]);
    const employeesWithoutDrivers = useMemo(() => employees.filter(employee => !drivers.some(driver => driver.employee_id === employee.id)), [drivers, employees]);

    const submit = async () => {
        if (!data) return;
        if (selectedEmployeeId == "") {
            notifyError('Selecione um motoboy');
            return
        }

        try {
            deliveryDriver.employee_id = selectedEmployeeId
            const response = isUpdate ? await UpdateDeliveryDriver(deliveryDriver, data) : await NewDeliveryDriver(deliveryDriver.employee_id, data)

            deliveryDriver.employee = employees.find(employee => employee.id === selectedEmployeeId) || new Employee();

            if (!isUpdate) {
                deliveryDriver.id = response
                notifySuccess(`Motoboy ${deliveryDriver.employee.name} adicionado com sucesso`);
            } else {
                notifySuccess(`Motoboy ${deliveryDriver.employee.name} atualizado com sucesso`);
            }

            queryClient.invalidateQueries({ queryKey: ['delivery-drivers'] });
            modalHandler.hideModal(modalName);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao salvar motoboy');
        }
    }

    const onDelete = async () => {
        if (!data) return;
        try {
            await DeleteDeliveryDriver(deliveryDriver.id, data);
            notifySuccess(`Motoboy ${deliveryDriver.employee.name} removido com sucesso`);
            queryClient.invalidateQueries({ queryKey: ['delivery-drivers'] });
            modalHandler.hideModal(modalName);
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Erro ao remover motoboy');
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
            {isUpdate && <ButtonsModal item={deliveryDriver.employee} name="Motoboy" onSubmit={submit} />}
            {!isUpdate && <ButtonsModal item={deliveryDriver} name="Motoboy" onSubmit={submit} />}
        </div>
    );
};

export default DeliveryDriverForm;