import PriceField from "@/app/components/modal/fields/price";
import Decimal from 'decimal.js';
import { ToUtcDate, ToUtcHoursMinutes } from "@/app/utils/date";
import RedeemCard from "./redeem";
import ChangeCard from "./change";
import Shift from "@/app/entities/shift/shift";
import RequestError from "@/app/utils/error";
import OpenShift from "@/app/api/shift/open/shift";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import User from "@/app/entities/user/user";
import { useModal } from "@/app/context/modal/context";
import { notifyError } from "@/app/utils/notifications";

interface ShiftProps {
    shift?: Shift | null;
    fetchShift: () => void;
}

const ShiftCard = ({ shift, fetchShift }: ShiftProps) => {
    const { data } = useSession();
    const [user, setUser] = useState<User>(new User());
    const [startChange, setStartChange] = useState<Decimal>(new Decimal(shift?.start_change || 0));
    const modalHandler = useModal();

    useEffect(() => {
        if (!data?.user.user) return;

        setUser(data?.user.user);
    }, [data?.user.user]);

    const handleOpenShift = async () => {
        if (!data) return;

        try {
            await OpenShift(startChange.toNumber(), data)
            fetchShift();
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao abrir turno");
        }
    }

    const onOpenModal = (shift: Shift) => {
        const onClose = () => {
            modalHandler.hideModal("close-shift")
        }

        modalHandler.showModal("close-shift", "Fechar turno", <ChangeCard openedAt={shift.opened_at} fetchShift={fetchShift} />, "md", onClose)
    }

    const onOpenRedeemModal = () => {
        const onClose = () => {
            modalHandler.hideModal("add-redeem")
        }

        modalHandler.showModal("add-redeem", "Adicionar resgate", <RedeemCard fetchShift={fetchShift} />, "md", onClose)
    }

    if (!shift) {
        return (
            <div className="bg-white p-4 shadow-md rounded-lg flex items-center">
                <div>
                    <h2 className="text-xl font-bold">Olá, {user.name}</h2>
                    <p className="text-gray-500">Nenhum turno aberto</p>
                </div>

                <div className="ml-auto text-right justify-around block">
                    <PriceField friendlyName='Troco inicial' name='start_change' value={startChange} setValue={setStartChange} />
                    <button className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        onClick={handleOpenShift}>Abrir turno</button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white p-4 shadow-md rounded-lg flex items-center">
            <div>
                <h2 className="text-xl font-bold">Olá, {user.name}</h2>
                <p>Turno aberto às: <span className="font-semibold">{ToUtcHoursMinutes(shift.opened_at)}</span></p>
                <p>Data: <span className="font-semibold">{ToUtcDate(shift.opened_at)}</span></p>
            </div>

            <div className="ml-auto text-right justify-around block">
                <div className="ml-auto text-right">
                    <p>Troco início: <span className="font-semibold">R$ {new Decimal(shift.start_change).toFixed(2)}</span></p>
                    <button className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    onClick={onOpenRedeemModal}
                    >Resgatar Dinheiro</button>
                </div>

                <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => onOpenModal(shift)}>Fechar Turno</button>
            </div>
        </div >
    )
}

export default ShiftCard