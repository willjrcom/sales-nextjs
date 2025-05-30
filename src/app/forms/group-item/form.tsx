import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import RequestError from '@/app/utils/error';
import GroupItem from '@/app/entities/order/group-item';
import { DateTimeField } from '@/app/components/modal/field';
import ScheduleGroupItem from '@/app/api/group-item/update/schedule/group-item';
import { FaCalendarTimes, FaTrash } from 'react-icons/fa';
import { useGroupItem } from '@/app/context/group-item/context';
import { notifySuccess, notifyError } from '@/app/utils/notifications';

const GroupItemForm = ({ item }: CreateFormsProps<GroupItem>) => {
    const [groupItem, setGroupItem] = useState<GroupItem>(item as GroupItem);
    const [startAt, setStartAt] = useState<string | null | undefined>(item?.start_at);
    const { data } = useSession();
    const contextGroupItem = useGroupItem();

    const onSchedule = async (newStartAt: string | null | undefined) => {
        if (!data) return;
        if (newStartAt === null) newStartAt = "";
        
        try {
            const prev = groupItem.start_at;
            await ScheduleGroupItem(groupItem, data, newStartAt);
            setGroupItem({ ...groupItem, start_at: newStartAt });
            setStartAt(newStartAt);
            contextGroupItem.fetchData(groupItem.id);
            
            // Notificação de sucesso conforme ação
            let msg = '';
            if ((!prev || prev === '') && newStartAt) msg = 'Agendamento criado com sucesso';
            else if (prev && newStartAt) msg = 'Agendamento atualizado com sucesso';
            else if (prev && !newStartAt) msg = 'Agendamento removido com sucesso';
            else msg = 'Agendamento processado com sucesso';
            notifySuccess(msg);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || 'Erro ao agendar');
            notifyError(err.message || 'Erro ao agendar');
        }
    };

    const showScheduleButton = !groupItem.start_at && startAt;
    const showUpdateButton = groupItem.start_at && groupItem.start_at !== startAt;
    const showRemoveButton = groupItem.start_at && !showUpdateButton;

    return (
        <>
            <div className="flex items-center space-x-4">
                <div className="flex-1">
                    <DateTimeField
                        friendlyName="Agendar"
                        name="schedule"
                        value={startAt}
                        setValue={setStartAt}
                    />
                </div>
                {showScheduleButton && (
                    <button
                        className="flex items-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-200"
                        onClick={() => onSchedule(startAt)}
                    >
                        <FaCalendarTimes className="mr-2" />
                        Agendar
                    </button>
                )}

                {showUpdateButton && (
                    <button
                        className="flex items-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-200"
                        onClick={() => onSchedule(startAt)}
                    >
                        <FaCalendarTimes className="mr-2" />
                        Atualizar
                    </button>
                )}

                {showRemoveButton && (
                    <button
                        className="flex items-center px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition duration-200"
                        onClick={() => onSchedule(null)}
                    >
                        <FaTrash className="mr-2" />
                        Remover
                    </button>
                )}
            </div>
        </>
    );
};

export default GroupItemForm;
