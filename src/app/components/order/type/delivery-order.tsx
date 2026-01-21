import ClientAddressForm from "@/app/forms/client/update-address-order";
import ButtonIcon from "../../button/button-icon";
import StatusComponent from "../../button/show-status";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import GetOrderByID from "@/app/api/order/[id]/order";
import { notifyError } from "@/app/utils/notifications";

interface DeliveryCardProps {
    orderId: string;
}

const DeliveryCard = ({ orderId }: DeliveryCardProps) => {
    const { data: session } = useSession();

    const { data: order } = useQuery({
        queryKey: ['order', 'current'],
        queryFn: async () => {
            if (!orderId || !session?.user?.access_token) return null;
            try {
                return await GetOrderByID(orderId, session);
            } catch (error) {
                notifyError('Erro ao buscar pedido');
                return null;
            }
        },
        enabled: !!orderId && !!session?.user?.access_token,
    });

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