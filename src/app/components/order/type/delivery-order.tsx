import ClientAddressForm from "@/app/forms/client/update-address-order";
import ButtonIcon from "../../button/button-icon";
import StatusComponent from "../../button/show-status";
import { useQueryClient } from "@tanstack/react-query";
import Order from "@/app/entities/order/order";

const DeliveryCard = () => {
    const queryClient = useQueryClient();
    const order = queryClient.getQueryData<Order>(['order', 'current']);

    if (!order || !order.delivery) return null
    const delivery = order?.delivery;
    const client = delivery?.client;
    const address = client?.address;
    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="flex justify-between items-center">
                <h2 className="font-bold mb-2">Entrega</h2>
                <ButtonIcon modalName={"edit-client-" + delivery?.client_id} title="Editar cliente" size="md">
                    <ClientAddressForm item={delivery?.client} deliveryOrderId={delivery?.id} />
                </ButtonIcon>
            </div>

            {delivery?.status && <p><StatusComponent status={delivery?.status} /></p>}
            <br />
            <p>{client?.name}</p>
            <p><strong>Endereço:</strong> {address?.street}, {address?.number}</p>
            <p><strong>Bairro:</strong> {address?.neighborhood}</p>
            <p><strong>Cidade:</strong> {address?.city}</p>
            <p><strong>Cep:</strong> {address?.cep}</p>
        </div>
    )
}

export default DeliveryCard