import React, { useEffect, useState } from 'react';
import DeliveryDriver from '@/app/entities/delivery-driver/delivery-driver';
import { useSession } from 'next-auth/react';
import ButtonsModal from '../../components/modal/buttons-modal';
import CreateFormsProps from '../create-forms-props';
import DeleteDeliveryDriver from '@/app/api/delivery-driver/delete/route';
import { useDeliveryDrivers } from '@/app/context/delivery-driver/context';
import NewDeliveryDriver from '@/app/api/delivery-driver/new/route';
import UpdateDeliveryDriver from '@/app/api/delivery-driver/update/route';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/api/error';
import { SelectField } from '@/app/components/modal/field';
import { useEmployees } from '@/app/context/employee/context';
import Employee from '@/app/entities/employee/employee';

const DeliveryDriverForm = ({ item, isUpdate }: CreateFormsProps<DeliveryDriver>) => {
    const modalName = isUpdate ? 'edit-delivery-driver-' + item?.id : 'new-delivery-driver'
    const modalHandler = useModal();
    const contextDeliveryDrivers = useDeliveryDrivers();
    const contextEmployees = useEmployees();
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
    const [deliveryDriver, setDeliveryDriver] = useState<DeliveryDriver>(item || new DeliveryDriver());
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [error, setError] = useState<RequestError | null>(null);
    const { data } = useSession();

    useEffect(() => {
        // remove repeted employees between deliveryDrivers and employees
        const employeesFiltered = contextEmployees.items.filter(employee => !contextDeliveryDrivers.items.some(deliveryDriver => deliveryDriver.employee_id === employee.id))
        setEmployees(employeesFiltered)
    }, [contextDeliveryDrivers.items, contextEmployees.items]);;

    const submit = async () => {
        if (!data) return;
        if (selectedEmployeeId == "") {
            setError(new RequestError('Selecione um motoboy'));
            return
        }
        
        try {
            deliveryDriver.employee_id = selectedEmployeeId
            const response = isUpdate ? await UpdateDeliveryDriver(deliveryDriver, data) : await NewDeliveryDriver(deliveryDriver.employee_id, data)
            setError(null);

            deliveryDriver.employee_id = selectedEmployeeId
            deliveryDriver.employee = contextEmployees.items.filter(employee => employee.id === selectedEmployeeId)[0]

            if (!isUpdate) {
                deliveryDriver.id = response
                contextDeliveryDrivers.addItem(deliveryDriver);
            } else {
                contextDeliveryDrivers.updateItem(deliveryDriver);
            }

            modalHandler.hideModal(modalName);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteDeliveryDriver(deliveryDriver.id, data)
        contextDeliveryDrivers.removeItem(deliveryDriver.id)
        modalHandler.hideModal(modalName);
    }
    
    return (
        <>
            {error && <p className='text-red-500'>{error.message}</p>}
            <SelectField friendlyName='Motoboy' name='name' setSelectedValue={setSelectedEmployeeId} selectedValue={selectedEmployeeId} values={employees} />
            <ButtonsModal item={deliveryDriver} name="Motoboy" onSubmit={submit} deleteItem={onDelete} />
        </>
    );
};

export default DeliveryDriverForm;