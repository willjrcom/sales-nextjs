import RequestError from "@/app/utils/error";
import AddRedeemToShift from "@/app/api/shift/redeem/add/shift";
import ButtonsModal from "@/app/components/modal/buttons-modal";
import { TextField } from "@/app/components/modal/field";
import PriceField from "@/app/components/modal/fields/price";
import Decimal from 'decimal.js';
import { useModal } from "@/app/context/modal/context";
import Shift from "@/app/entities/shift/shift";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { notifyError } from "@/app/utils/notifications";

interface RedeemCardProps {
    fetchShift: () => void;
}

const RedeemCard = ({ fetchShift }: RedeemCardProps) => {
    const [name, setName] = useState<string>("");
    const [value, setValue] = useState<Decimal>(new Decimal(0));
    const { data } = useSession();
    const modalHandler = useModal();

    const handleAddRedeem = async (name: string, value: Decimal) => {
        if (!data) return;

        try {
            await AddRedeemToShift(name, value.toNumber(), data)
            fetchShift();
            modalHandler.hideModal("add-redeem")
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao adicionar resgate");
        }
    }

    return (
        <>
            <TextField friendlyName='Motivo' name='name' value={name} setValue={setName} />
            <PriceField friendlyName='Valor' name='value' value={value} setValue={setValue} />
            <ButtonsModal item={{ id: "", name: "Adicionar resgate" }} onSubmit={() => handleAddRedeem(name, value)} name='Adcionar resgate' />
        </>
    )
}

interface RedeemsProps {
    shift: Shift;
}

const Redeems = ({ shift }: RedeemsProps) => {
    return (
        <div className="bg-white p-4 shadow-md rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Resgates</h3>
            <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-left">
                <thead>
                    <tr>
                        <th className="pb-2">Motivo</th>
                        <th className="pb-2">Valor</th>
                    </tr>
                </thead>
                <tbody>
                    {!shift?.redeems?.length && (
                        <tr>
                            <td colSpan={2} className="py-2 text-center">Nenhum resgate encontrado</td>
                        </tr>
                    )}
                    {shift?.redeems?.map((redeem, index) => (
                        <tr key={index} className="border-t">
                            <td className="py-2">{redeem.name}</td>
                            <td className="py-2">R$ {new Decimal(redeem.value).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
    )
}

export default RedeemCard
export { Redeems}