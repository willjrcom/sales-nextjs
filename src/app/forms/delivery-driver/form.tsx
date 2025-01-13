import React, { useEffect, useState } from 'react';
import DeliveryDriver from '@/app/entities/delivery-driver/delivery-driver';
import { useSession } from 'next-auth/react';
import ButtonsModal from '../../components/modal/buttons-modal';
import CreateFormsProps from '../create-forms-props';
import DeleteDeliveryDriver from '@/app/api/delivery-driver/delete/route';
import NewDeliveryDriver from '@/app/api/delivery-driver/new/route';
import UpdateDeliveryDriver from '@/app/api/delivery-driver/update/route';
import { useModal } from '@/app/context/modal/context';
import RequestError from '@/app/api/error';
import { SelectField } from '@/app/components/modal/field';
import Employee from '@/app/entities/employee/employee';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { addDeliveryDriver, removeDeliveryDriver, updateDeliveryDriver } from '@/redux/slices/delivery-drivers';

const DeliveryDriverForm = ({ item, isUpdate }: CreateFormsProps<DeliveryDriver>) => {
    const modalName = isUpdate ? 'edit-delivery-driver-' + item?.id : 'new-delivery-driver'
    const modalHandler = useModal();
    const deliveryDriversSlice = useSelector((state: RootState) => state.deliveryDrivers);
    const employeesSlice = useSelector((state: RootState) => state.employees);
    const dispatch = useDispatch<AppDispatch>();
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
    const [deliveryDriver, setDeliveryDriver] = useState<DeliveryDriver>(item || new DeliveryDriver());
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [error, setError] = useState<RequestError | null>(null);
    const { data } = useSession();

    useEffect(() => {
        // remove repeted employees between deliveryDrivers and employees
        const employeesFiltered = Object.values(employeesSlice.entities).filter(employee => !Object.values(deliveryDriversSlice.entities).some(deliveryDriver => deliveryDriver.employee_id === employee.id))
        setEmployees(employeesFiltered)
    }, [deliveryDriversSlice.entities, employeesSlice.entities]);

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

            deliveryDriver.employee = Object.values(employeesSlice.entities).filter(employee => employee.id === selectedEmployeeId)[0]

            if (!isUpdate) {
                deliveryDriver.id = response
                dispatch(addDeliveryDriver(deliveryDriver));
            } else {
                dispatch(updateDeliveryDriver({ type: "UPDATE", payload: { id: deliveryDriver.id, changes: deliveryDriver }}));
            }

            modalHandler.hideModal(modalName);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    const onDelete = async () => {
        if (!data) return;
        DeleteDeliveryDriver(deliveryDriver.id, data);
        dispatch(removeDeliveryDriver(deliveryDriver.id));
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