import { showStatus } from "@/app/utils/status";
import ButtonIcon from "../button/button-icon";
import Order from "@/app/entities/order/order";
import StatusComponent from "../button/show-status";

interface OrderProps {
    order: Order | null;
}

const PickupCard = ({ order }: OrderProps) => {
    const pickup = order?.pickup;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="flex justify-between items-center">
                <h2 className="font-bold mb-2">Retirada/Balcão</h2>
                <ButtonIcon modalName={"edit-pickup-" + order?.pickup?.name} title="Editar nome" size="md">
                    <h1>Editar nome</h1>
                </ButtonIcon>
            </div>

            <p>{pickup?.name}</p>
            {pickup?.status && <p><strong>Status:</strong> <StatusComponent status={pickup?.status} /></p>}
        </div>
    )
}

export default PickupCard