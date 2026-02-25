
import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/ui/page-title';
import CrudTable from "@/app/components/crud/table";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import ShiftColumns from "@/app/entities/shift/table-columns";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import GetAllShifts from "@/app/api/shift/all/shift";
import { notifyError } from "@/app/utils/notifications";
import GetCompany from "@/app/api/company/company";

const ListShift = () => {
    const { data: session } = useSession();
    const [lastUpdate, setLastUpdate] = useState(FormatRefreshTime(new Date()));
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const { isPending, error, data: shiftsResponse, refetch } = useQuery({
        queryKey: ['shifts', pagination.pageIndex, pagination.pageSize],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetAllShifts(session!, pagination.pageIndex, pagination.pageSize);
        },
        enabled: !!session?.user?.access_token,
        placeholderData: keepPreviousData,
    });

    const { data: company } = useQuery({
        queryKey: ['company'],
        queryFn: () => GetCompany(session!),
        enabled: !!session?.user?.access_token,
    });

    useEffect(() => {
        if (error) notifyError('Erro ao carregar turnos: ' + error.message);
    }, [error]);

    const shifts = useMemo(() => shiftsResponse?.items || [], [shiftsResponse?.items]);
    const totalCount = useMemo(() => parseInt(shiftsResponse?.headers.get('X-Total-Count') || '0'), [shiftsResponse?.items]);

    return (
        <>
            <CrudLayout title={<PageTitle title="Turnos" tooltip="listagem de turnos anteriores." />}
                refreshButton={
                    <Refresh
                        onRefresh={refetch}
                        isPending={isPending}
                        lastUpdate={lastUpdate}
                    />
                }
                tableChildren={
                    <CrudTable
                        columns={ShiftColumns(session!, company)}
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