"use client";
import RequestError from "@/app/api/error";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";



const ProcessRule = () => {
    const { id } = useParams();
    const { data } = useSession();
    const [error, setError] = useState<RequestError | null>(null)

    const getOrder = useCallback(async () => {
        if (!id || !data) return;
        try {
            context.fetchData(id as string);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }, [data?.user.idToken, id]);

    useEffect(() => {
        getOrder();
    }, [data?.user.idToken]);

    return (
        <div className='max-w-[85vw] flex-auto h-full'>
            <h1 className="text-2xl font-bold mb-4"></h1>
        </div>
    );
}

export default ProcessRule