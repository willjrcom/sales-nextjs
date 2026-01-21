import ButtonIcon from "../../button/button-icon";
import StatusComponent from "../../button/show-status";
import PickupNameForm from "@/app/forms/pickup-order/update-name-order";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import GetOrderByID from "@/app/api/order/[id]/order";
import { notifyError } from "@/app/utils/notifications";

interface PickupCardProps {
    orderId: string;
}

const PickupCard = ({ orderId }: PickupCardProps) => {
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