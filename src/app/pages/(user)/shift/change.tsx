import RequestError from "@/app/utils/error";
import CloseShift from "@/app/api/shift/close/shift";
import ButtonsModal from "@/app/components/modal/buttons-modal";
import PriceField from "@/app/components/modal/fields/price";
import Decimal from 'decimal.js';
import { useModal } from "@/app/context/modal/context";
import { ToUtcDatetime } from "@/app/utils/date";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { notifyError } from "@/app/utils/notifications";

interface ChangeCardProps {
    openedAt: string;
    fetchShift: () => void;
}

const ChangeCard = ({ openedAt, fetchShift }: ChangeCardProps) => {
    const [endChange, setEndChange] = useState<Decimal>(new Decimal(0));
    const [isProcessing, setIsProcessing] = useState(false);
    const { data } = useSession();
    const modalHandler = useModal();

    const handleCloseShift = async (endChange: Decimal) => {
        if (!data || isProcessing) return;
        setIsProcessing(true);
        try {
            await CloseShift(endChange.toNumber(), data)
            fetchShift();
            modalHandler.hideModal("close-shift")
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao fechar turno");
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <>
            <PriceField friendlyName='Troco final' name='end_change' value={endChange} setValue={setEndChange} />
            <ButtonsModal item={{ id: "", name: "Fechar turno" }} onSubmit={() => handleCloseShift(endChange)} name={'Turno: ' + ToUtcDatetime(openedAt)} isAddItem={true} isPending={isProcessing} />
        </>
    )
}

export default ChangeCard