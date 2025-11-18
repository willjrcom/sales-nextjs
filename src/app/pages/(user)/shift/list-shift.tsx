
import CrudLayout from "@/app/components/crud/layout";
import PageTitle from '@/app/components/PageTitle';
import CrudTable from "@/app/components/crud/table";
import Refresh from "@/app/components/crud/refresh";
import { FaFilter } from "react-icons/fa";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useSession } from "next-auth/react";
import ShiftDashboard from "./shift-dashboard";
import ShiftColumns from "@/app/entities/shift/table-columns";
import Shift from "@/app/entities/shift/shift";
import { fetchShifts } from "@/redux/slices/shifts";

const ListShift = () => {
    const shiftsSlice = useSelector((state: RootState) => state.shifts);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    useEffect(() => {
        const token = data?.user?.access_token;
        const hasShiftsSlice = shiftsSlice.ids.length > 0;

        if (token && !hasShiftsSlice) {
            dispatch(fetchShifts({ session: data }));
        }
    }, [data?.user.access_token, shiftsSlice.ids.length]);

    // shifts
    useEffect(() => {
        if (Object.keys(shiftsSlice.entities).length === 0) return;

        setShifts(Object.values(shiftsSlice.entities));
    }, [shiftsSlice.entities]);

    if (shiftsSlice.loading) {
        return (
            <h1>Carregando página...</h1>
        )
    }

    return (
        <>
            <CrudLayout title={<PageTitle title="Turnos" tooltip="listagem de turnos anteriores." />}
                searchButtonChildren={<></>}
                refreshButton={
                    <Refresh
                        slice={shiftsSlice}
                        fetchItems={fetchShifts}
                    />
                }
                tableChildren={
                    <CrudTable
                        columns={ShiftColumns()}
                        data={shifts}>
                    </CrudTable>
                }
            />
        </>
    )
}
export default ListShift;