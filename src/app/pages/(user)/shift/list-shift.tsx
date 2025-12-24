
import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/PageTitle';
import CrudTable from "@/app/components/crud/table";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ShiftColumns from "@/app/entities/shift/table-columns";
import { useQuery } from "@tanstack/react-query";
import GetAllShifts from "@/app/api/shift/all/shift";
import { notifyError } from "@/app/utils/notifications";

const ListShift = () => {
    const { data } = useSession();
    const [lastUpdate, setLastUpdate] = useState(FormatRefreshTime(new Date()));

    const { isPending, error, data: shiftsResponse, refetch } = useQuery({
        queryKey: ['shifts'],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetAllShifts(data!);
        },
        enabled: !!data?.user?.access_token,
    });

    useEffect(() => {
        if (error) notifyError('Erro ao carregar turnos');
    }, [error]);

    const shifts = shiftsResponse?.items || [];

    return (
        <>
            <CrudLayout title={<PageTitle title="Turnos" tooltip="listagem de turnos anteriores." />}
                searchButtonChildren={<></>}
                refreshButton={
                    <Refresh
                        onRefresh={refetch}
                        isPending={isPending}
                        lastUpdate={lastUpdate}
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