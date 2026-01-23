
import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/PageTitle';
import CrudTable from "@/app/components/crud/table";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import ShiftColumns from "@/app/entities/shift/table-columns";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import GetAllShifts from "@/app/api/shift/all/shift";
import { notifyError } from "@/app/utils/notifications";

const ListShift = () => {
    const { data } = useSession();
    const [lastUpdate, setLastUpdate] = useState(FormatRefreshTime(new Date()));
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const { isPending, error, data: shiftsResponse, refetch } = useQuery({
        queryKey: ['shifts', pagination.pageIndex, pagination.pageSize],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetAllShifts(data!, pagination.pageIndex, pagination.pageSize);
        },
        enabled: !!data?.user?.access_token,
        placeholderData: keepPreviousData,
    });

    useEffect(() => {
        if (error) notifyError('Erro ao carregar turnos');
    }, [error]);

    const shifts = useMemo(() => shiftsResponse?.items || [], [shiftsResponse?.items]);
    const totalCount = useMemo(() => parseInt(shiftsResponse?.headers.get('X-Total-Count') || '0'), [shiftsResponse?.items]);

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
                        data={shifts}
                        totalCount={totalCount}
                        onPageChange={(pageIndex, pageSize) => {
                            setPagination({ pageIndex, pageSize });
                        }}>
                    </CrudTable>
                }
            />
        </>
    )
}
export default ListShift;