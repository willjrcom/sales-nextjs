"use client";

import { useEffect, useState } from "react";
import ShiftDashboard from "./shift-dashboard"
import PageTitle from '@/app/components/PageTitle';
import Shift from "@/app/entities/shift/shift";
import { useSession } from "next-auth/react";
import GetCurrentShift from "@/app/api/shift/current/shift";
import RequestError from "@/app/utils/error";
import ShiftManager from "./shift-manager";

const PageShift = () => {
    const [shift, setShift] = useState<Shift | null>();
    const { data } = useSession();

    const fetchCurrentShift = async () => {
        if (!data) return;

        try {
            const currentShift = await GetCurrentShift(data);
            // Converte objeto plano em instância de Shift para ter acesso aos métodos
            const shiftInstance = Object.assign(new Shift(), currentShift);
            setShift(shiftInstance);

        } catch (error: RequestError | any) {
            setShift(null)
        }
    }

    useEffect(() => {
        fetchCurrentShift()
    }, [data?.user.access_token])

    return (
        <>
            <PageTitle title="Turno" tooltip="Painel do turno atual, exibindo vendas, cancelamentos e status." />

            <div className="p-8 bg-gray-100 h-[80vh] overflow-y-auto">
                <ShiftManager shift={shift} fetchShift={fetchCurrentShift} />
                <ShiftDashboard shift={shift} />
            </div>
        </>
    )
}

export default PageShift