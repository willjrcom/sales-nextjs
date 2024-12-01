import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import CreateFormsProps from '../create-forms-props';
import ErrorForms from '../../components/modal/error-forms';
import RequestError from '@/app/api/error';
import GroupItem from '@/app/entities/order/group-item';
import { DateTimeField } from '@/app/components/modal/field';
import ScheduleGroupItem from '@/app/api/group-item/update/schedule/route';
import { FaCalendarTimes, FaTrash } from 'react-icons/fa';
import { useGroupItem } from '@/app/context/group-item/context';

const GroupItemForm = ({ item }: CreateFormsProps<GroupItem>) => {
    const [groupItem, setGroupItem] = useState<GroupItem>(item as GroupItem)
    const [startAt, setStartAt] = useState<Date | null | undefined>(item?.start_at);
    const [error, setError] = useState<RequestError | null>(null);
    const { data } = useSession();
    const contextGroupItem = useGroupItem();
    
    const onSchedule = async (startAt?: Date | null | undefined) => {
        if (!data) return;
        try {
            await ScheduleGroupItem(groupItem, startAt, data);
            setGroupItem({ ...groupItem, start_at: startAt as Date });
            setStartAt(startAt);
            await contextGroupItem.fetchData(groupItem.id);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }

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
                {!groupItem.start_at && <button
                    className="flex items-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-200"
                    onClick={() => onSchedule(startAt)}
                >
                    <FaCalendarTimes className="mr-2" />
                    Agendar
                </button>}

                {groupItem.start_at && <button
                    className="flex items-center px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition duration-200"
                    onClick={() => onSchedule()}
                >
                    <FaTrash className="mr-2" />
                    Remover
                </button>}
            </div>
            {error && <p className="text-red-500">{error.message}</p>}
        </>
    );
};

export default GroupItemForm;