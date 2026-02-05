import Order from "@/app/entities/order/order";
import { FaLuggageCart, FaMotorcycle, FaUtensils } from "react-icons/fa";
import CardOrder from "../../../../components/card-order/card-order";
import { useModal } from "@/app/context/modal/context";

type BadgeVariant = "gray" | "blue" | "green" | "yellow" | "red" | "purple";

const Badge = ({
    label,
    variant = "gray",
    className = "",
}: {
    label: string;
    variant?: BadgeVariant;
    className?: string;
}) => {
    const map: Record<BadgeVariant, string> = {
        gray: "bg-gray-100 text-gray-700 border-gray-200",
        blue: "bg-blue-50 text-blue-700 border-blue-200",
        green: "bg-green-50 text-green-700 border-green-200",
        yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
        red: "bg-red-50 text-red-700 border-red-200",
        purple: "bg-purple-50 text-purple-700 border-purple-200",
    };

    return (
        <span
            className={`text-xs font-semibold px-2 py-1 rounded-full border ${map[variant]} ${className}`}
            title={label}
        >
            {label}
        </span>
    );
};

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
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    const rest = mins % 60;
    return `${hours}h${rest > 0 ? ` ${rest}min` : ""}`;
}

function formatCurrencyBR(value: any) {
    try {
        const num =
            typeof value?.toNumber === "function" ? value.toNumber() : Number(value);
        if (Number.isNaN(num)) return "—";
        return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    } catch {
        return "—";
    }
}

function getOrderType(order: Order) {
    if (order.delivery) return "delivery";
    if (order.table) return "table";
    if (order.pickup) return "pickup";
    return "unknown";
}

function getTypeIcon(order: Order) {
    const type = getOrderType(order);
    if (type === "delivery")
        return { icon: <FaMotorcycle className="w-4 h-4" />, bg: "bg-blue-500" };
    if (type === "table")
        return { icon: <FaUtensils className="w-4 h-4" />, bg: "bg-green-500" };
    if (type === "pickup")
        return { icon: <FaLuggageCart className="w-4 h-4" />, bg: "bg-yellow-500" };
    return { icon: <FaLuggageCart className="w-4 h-4" />, bg: "bg-gray-400" };
}

function getSecondaryInfo(order: Order) {
    if (order.delivery) {
        const deliveryStatus = order.delivery.status;
        const clientName = order.delivery?.client?.name || "";
        const flags: { label: string; variant: BadgeVariant }[] = [];

        if (deliveryStatus === "Pending") flags.push({ label: "Entrega Pendente", variant: "yellow" });
        if (deliveryStatus === "Ready") flags.push({ label: "Entrega Pronto", variant: "purple" });
        if (deliveryStatus === "Shipped") flags.push({ label: "Entrega Enviado", variant: "blue" });
        if (deliveryStatus === "Delivered") flags.push({ label: "Entrega Entregue", variant: "green" });
        if (deliveryStatus === "Cancelled") flags.push({ label: "Entrega Cancelado", variant: "red" });

        const timeRef =
            formatTimeAgo(order.delivery.shipped_at) ||
            formatTimeAgo(order.delivery.ready_at) ||
            formatTimeAgo(order.delivery.pending_at);

        const timeLabel =
            order.delivery.pending_at
                ? "pendente"
                : order.delivery.ready_at
                    ? "pronto"
                    : order.delivery.shipped_at
                        ? "enviado"
                        : order.delivery.delivered_at
                            ? "entregue"
                            : order.delivery.cancelled_at
                                ? "cancelado"
                                : null;

        return { title: clientName, flags, timeRef, timeLabel };
    }

    if (order.table) {
        const tableName = order.table.table?.name || order.table.name || "";
        const flags: { label: string; variant: BadgeVariant }[] = [];

        if (order.table.status === "Pending") flags.push({ label: "Mesa Pendente", variant: "yellow" });
        if (order.table.status === "Closed") flags.push({ label: "Mesa Fechada", variant: "green" });
        if (order.table.status === "Cancelled") flags.push({ label: "Mesa Cancelada", variant: "red" });

        return {
            title: tableName,
            flags,
            timeRef: formatTimeAgo(order.table.pending_at),
            timeLabel: order.table.pending_at ? "pendente" : null,
        };
    }

    if (order.pickup) {
        const pickupName = order.pickup.name || "";
        const flags: { label: string; variant: BadgeVariant }[] = [];
        const pickupStatus = order.pickup.status;

        if (pickupStatus === "Pending") flags.push({ label: "Balcão Pendente", variant: "yellow" });
        if (pickupStatus === "Ready") flags.push({ label: "Balcão Pronto", variant: "green" });
        if (pickupStatus === "Delivered") flags.push({ label: "Balcão Retirado", variant: "blue" });
        if (pickupStatus === "Cancelled") flags.push({ label: "Balcão Cancelado", variant: "red" });

        const timeRef =
            formatTimeAgo(order.pickup.delivered_at) ||
            formatTimeAgo(order.pickup.ready_at) ||
            formatTimeAgo(order.pickup.pending_at);

        const timeLabel =
            order.pickup.delivered_at
                ? "retirado"
                : order.pickup.ready_at
                    ? "pronto"
                    : order.pickup.pending_at
                        ? "pendente"
                        : order.pickup.cancelled_at
                            ? "cancelado"
                            : null;

        return { title: pickupName, flags, timeRef, timeLabel };
    }

    return { title: "", flags: [], timeRef: null, timeLabel: null };
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

    const { icon, bg } = getTypeIcon(order);
    const info = getSecondaryInfo(order);

    const total = formatCurrencyBR(order.total_payable);
    const items = order.quantity_items ?? 0;

    // badge tempo (limitado)
    const timeBadge =
        info.timeRef && info.timeLabel
            ? `${info.timeLabel} há ${info.timeRef}`
            : null;

    return (
        <div
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
            onClick={OpenOrder}
        >
            <div className="flex items-start justify-between gap-3">
                {/* LEFT */}
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                    {/* Linha 1 */}
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="text-lg font-bold truncate">
                            Pedido {order.order_number}
                        </div>

                        <div className="text-sm text-gray-600 truncate">
                            {info.flags?.slice(0, 2).map((f, idx) => (
                                <Badge key={idx} label={f.label} variant={f.variant} />
                            ))}
                        </div>
                    </div>

                    {/* Linha 3 */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge label={`${items} itens`} variant="gray" />
                        <Badge label={total} variant="gray" />

                        {timeBadge && (
                            <Badge
                                label={timeBadge}
                                variant="gray"
                                className="max-w-[180px] truncate"
                            />
                        )}
                    </div>
                </div>

                {/* RIGHT ICON */}
                <div className={`shrink-0 p-2 rounded-full text-white ${bg}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default OrderItemList;
