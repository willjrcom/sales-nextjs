import Order from "@/app/entities/order/order";
import { Bike, Utensils, Package, Clock, ShoppingBag, ChevronRight, User } from "lucide-react";
import CardOrder from "../../../../components/card-order/card-order";
import { useModal } from "@/app/context/modal/context";
import { formatCurrency } from "@/app/utils/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function safeDate(d?: any): Date | null {
    if (!d) return null;
    const date = new Date(d);
    return isNaN(date.getTime()) ? null : date;
}

function formatTimeAgo(date?: any) {
    const dt = safeDate(date);
    if (!dt) return null;

    const diff = Date.now() - dt.getTime();
    if (diff < 60_000) return "agora";
    const mins = Math.floor(diff / 60_000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const rest = mins % 60;
    return `${hours}h${rest > 0 ? `${rest}m` : ""}`;
}

function getOrderType(order: Order) {
    if (order.delivery) return "delivery";
    if (order.table) return "table";
    if (order.pickup) return "pickup";
    return "unknown";
}

function getTypeConfig(order: Order) {
    const type = getOrderType(order);
    if (type === "delivery")
        return { icon: Bike, color: "text-blue-600", bg: "bg-blue-50", label: "Delivery" };
    if (type === "table")
        return { icon: Utensils, color: "text-emerald-600", bg: "bg-emerald-50", label: "Mesa" };
    if (type === "pickup")
        return { icon: ShoppingBag, color: "text-amber-600", bg: "bg-amber-50", label: "Balcão" };
    return { icon: Package, color: "text-gray-600", bg: "bg-gray-50", label: "Outro" };
}

function getOrderInfo(order: Order) {
    if (order.delivery) {
        let statusDelivery = "Entrega Pendente"
        switch (order.delivery.status) {
            case "Shipped":
                statusDelivery = "Entrega em Andamento"
                break;
            case "Delivered":
                statusDelivery = "Entrega Realizada"
                break;
            case "Cancelled":
                statusDelivery = "Entrega Cancelada"
                break;
        }
        return {
            title: order.delivery?.client?.name || "Cliente S/ Nome",
            subtitle: statusDelivery,
            time: formatTimeAgo(order.created_at)
        };
    }
    if (order.table) {
        let statusTable = "Mesa Aberta"
        switch (order.table.status) {
            case "Closed":
                statusTable = "Mesa Fechada"
                break;
            case "Cancelled":
                statusTable = "Mesa Cancelada"
                break;
        }
        return {
            title: `Mesa ${order.table.table?.name || "?"}`,
            subtitle: statusTable,
            time: formatTimeAgo(order.created_at)
        };
    }
    if (order.pickup) {
        let statusPickup = ""
        switch (order.pickup.status) {
            case "Delivered":
                statusPickup = "Entregue no Balcão"
                break;
            case "Cancelled":
                statusPickup = "Retirada Cancelada"
                break;
        }
        return {
            title: order.pickup.name || "Cliente S/ Nome",
            subtitle: statusPickup,
            time: formatTimeAgo(order.created_at)
        };
    }
    return { title: "Pedido #" + order.order_number, subtitle: "", time: formatTimeAgo(order.created_at) };
}

interface OrderItemListProps {
    order: Order;
}

const OrderItemList = ({ order }: OrderItemListProps) => {
    const modalHandler = useModal();

    const OpenOrder = () => {
        const onClose = () => {
            modalHandler.hideModal("show-order-" + order.id);
            modalHandler.hideModal("show-staging-orders");
        };

        modalHandler.showModal(
            "show-order-" + order.id,
            "Ver Pedido",
            <CardOrder orderId={order.id} />,
            "xl",
            onClose
        );
    };

    const { icon: TypeIcon, color, bg, label } = getTypeConfig(order);
    const info = getOrderInfo(order);
    const total = formatCurrency(Number(order.total));
    const itemsCount = order.quantity_items ?? 0;

    return (
        <Card
            className="group cursor-pointer border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white overflow-hidden rounded-2xl active:scale-[0.98]"
            onClick={OpenOrder}
        >
            <CardContent className="p-0">
                <div className="p-4 flex flex-col gap-3">
                    {/* Header: Tipo e Tempo */}
                    <div className="flex items-center justify-between">
                        <div className={cn("flex items-center gap-2 px-2 py-1 rounded-lg", bg)}>
                            <TypeIcon className={cn("w-3.5 h-3.5", color)} />
                            <span className={cn("text-[10px] font-black uppercase tracking-wider", color)}>
                                {label}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">
                                {info.time}
                            </span>
                        </div>
                    </div>

                    {/* Main Info */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform">
                            <h3 className="text-base font-black text-gray-800 tracking-tight leading-tight truncate pr-2">
                                {info.title}
                            </h3>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 shrink-0" />
                        </div>
                        {info.subtitle && (
                            <p className="text-xs font-bold text-gray-400 tracking-tight leading-none italic truncate">
                                {info.subtitle}
                            </p>
                        )}
                    </div>

                    {/* Footer: Itens e Total */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <div className="flex items-center gap-1.5 font-bold text-gray-500">
                            <div className="flex -space-x-2 mr-1">
                                <div className="w-5 h-5 rounded-full bg-gray-100 border border-white flex items-center justify-center">
                                    <ShoppingBag className="w-3 h-3 text-gray-400" />
                                </div>
                            </div>
                            <span className="text-[10px] uppercase tracking-tighter">
                                {itemsCount} {itemsCount === 1 ? 'item' : 'itens'}
                            </span>
                        </div>
                        <Badge variant="secondary" className="bg-gray-50 text-gray-600 font-black tracking-tight rounded-lg px-2 h-6 border-none">
                            {total}
                        </Badge>
                    </div>
                </div>

                {/* Status Bar */}
                <div className={cn(
                    "h-1.5 w-full",
                    order.status === "Pending" ? "bg-amber-400" : "bg-emerald-400"
                )} />
            </CardContent>
        </Card>
    );
};

export default OrderItemList;
