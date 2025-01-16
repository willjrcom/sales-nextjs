import RequestError from "@/app/api/error";
import AddRedeemToShift from "@/app/api/shift/redeem/add/route";
import ButtonsModal from "@/app/components/modal/buttons-modal";
import { TextField } from "@/app/components/modal/field";
import PriceField from "@/app/components/modal/fields/price";
import { useModal } from "@/app/context/modal/context";
import Shift from "@/app/entities/shift/shift";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface RedeemCardProps {
    fetchShift: () => void;
}

const RedeemCard = ({ fetchShift }: RedeemCardProps) => {
    const [name, setName] = useState<string>("");
    const [value, setValue] = useState<number>(0);
    const [error, setError] = useState<RequestError | null>();
    const { data } = useSession();
    const modalHandler = useModal();

    const handleAddRedeem = async (name: string, value: number) => {
        if (!data) return;

        try {
            await AddRedeemToShift(name, value, data)
            setError(null);
            fetchShift();
            modalHandler.hideModal("add-redeem")
        } catch (error) {
            setError(error as RequestError);
        }
    }

    return (
        <>
            {error && <p className="text-red-500">{error.message}</p>}
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
            <table className="w-full text-left">
                <thead>
                    <tr>
                        <th className="pb-2">Motivo</th>
                        <th className="pb-2">Valor</th>
                    </tr>
                </thead>
                <tbody>
                    {shift?.redeems?.map((redeem, index) => (
                        <tr key={index} className="border-t">
                            <td className="py-2">{redeem.name}</td>
                            <td className="py-2">{redeem.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default RedeemCard
export { Redeems}