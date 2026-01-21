import { useQueryClient } from "@tanstack/react-query";
import ButtonIcon from "../../button/button-icon";
import StatusComponent from "../../button/show-status";
import PickupNameForm from "@/app/forms/pickup-order/update-name-order";
import Order from "@/app/entities/order/order";

const PickupCard = () => {
    const queryClient = useQueryClient();
    const order = queryClient.getQueryData<Order>(['order', 'current']);

    if (!order || !order.pickup) return null
    const pickup = order.pickup;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="flex justify-between items-center">
                <h2 className="font-bold mb-2">Retirada/Balcão</h2>
                <ButtonIcon modalName={"edit-pickup-order-name-" + order?.pickup?.id} title="Editar nome" size="md">
                    <PickupNameForm item={pickup} pickupOrderId={pickup?.id} />
                </ButtonIcon>
            </div>

            <p>{pickup?.name}</p>
            {pickup?.status && <p><StatusComponent status={pickup?.status} /></p>}
        </div>
    )
}

export default PickupCard