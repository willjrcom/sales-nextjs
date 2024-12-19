"use client";
import RequestError from "@/app/api/error";
import GetProcessesByProcessRuleID from "@/app/api/order-process/by-process-rule/route";
import { OrderProcess } from "@/app/entities/order-process/order-process";
import ProcessRule from "@/app/entities/process-rule/process-rule";
import { RootState } from "@/redux/store";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CardOrderProcess from "../card";

const PageProcessRule = () => {
    const { id } = useParams();
    const { data } = useSession();
    const [error, setError] = useState<RequestError | null>(null)
    const categoriesSlice = useSelector((state: RootState) => state.categories);
    const [processRule, setProcessRule] = useState<ProcessRule | null>(null);
    const [orderProcesses, setOrderProcesses] = useState<OrderProcess[]>([]);

    const getOrder = useCallback(async () => {
        if (!id || !data) return;
        try {
            const processes = await GetProcessesByProcessRuleID(id as string, data);
            setOrderProcesses(processes);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }, [data?.user.idToken, id]);

    useEffect(() => {
        getOrder();
    }, [data?.user.idToken]);

    useEffect(() => {
        if (Object.keys(categoriesSlice.entities).length === 0) return;
        const category = Object.values(categoriesSlice.entities).find((category) => category.process_rules.some((processRule) => processRule.id === id));
        if (!category) return;

        const processRule = category?.process_rules.find((processRule) => processRule.id === id);
        if (!processRule) return;

        setProcessRule(processRule);
    }, [categoriesSlice.entities, id]);

    if (!processRule) return null;

    return (
        <div className='max-w-[85vw] flex-auto h-full'>
            <h1 className="text-2xl font-bold mb-4">{processRule?.name}</h1>
            {orderProcesses?.sort((a, b) => a.status === "Started" ? -1 : 1).map((process) => <CardOrderProcess key={process.id} orderProcess={process} />)}
        </div>
    );
}

export default PageProcessRule