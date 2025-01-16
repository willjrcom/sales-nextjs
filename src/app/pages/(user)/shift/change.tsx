import RequestError from "@/app/api/error";
import CloseShift from "@/app/api/shift/close/route";
import ButtonsModal from "@/app/components/modal/buttons-modal";
import PriceField from "@/app/components/modal/fields/price";
import { ToUtcDatetime } from "@/app/utils/date";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface ChangeCardProps {
    openedAt: string;
    fetchShift: () => void;
}

const ChangeCard = ({ openedAt, fetchShift }: ChangeCardProps) => {
    const [endChange, setEndChange] = useState<number>(0);
    const [error, setError] = useState<RequestError | null>();
    const { data } = useSession();

    const handleCloseShift = async (endChange: number) => {
        if (!data) return;

        try {
            await CloseShift(endChange, data)
            setError(null);
            fetchShift();
        } catch (error) {
            setError(error as RequestError);
        }
    }

    return (
        <>
            {error && <p className="text-red-500">{error.message}</p>}
            <PriceField friendlyName='Troco final' name='end_change' value={endChange} setValue={setEndChange} />
            <ButtonsModal item={{ id: "", name: "Fechar turno" }} onSubmit={() => handleCloseShift(endChange)} name={'Turno: ' + ToUtcDatetime(openedAt)} />
        </>
    )
}

export default ChangeCard