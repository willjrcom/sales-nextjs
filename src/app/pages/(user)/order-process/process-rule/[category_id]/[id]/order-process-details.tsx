import { useModal } from "../../../../../../context/modal/context";
import OrderProcess from "../../../../../../entities/order-process/order-process";
import { ToUtcTimeWithSeconds } from "../../../../../../utils/date";
import CancelOrderProcess from "./cancel-process-order";
import ItemDetails from "./item-details";
import { Printer, MessageSquare, Package, Layers, Hash, X } from "lucide-react";
import { Button } from "../../../../../../../components/ui/button";
import { Badge } from "../../../../../../../components/ui/badge";
import printGroupItem from "../../../../../../components/print/print-group-item";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import GroupItem from "../../../../../../entities/order/group-item";

interface OrderProcessDetailsProps {
    orderProcess: OrderProcess;
}

const OrderProcessDetails = ({ orderProcess }: OrderProcessDetailsProps) => {
    const groupItem = useMemo(() => {
        if (orderProcess.group_item && orderProcess.group_item.items && orderProcess.group_item.items.length > 0) {
            return orderProcess.group_item;
        }

        if (orderProcess.snapshot?.data) {
            const data = typeof orderProcess.snapshot.data === 'string'
                ? JSON.parse(orderProcess.snapshot.data)
                : orderProcess.snapshot.data;

            return new GroupItem(data);
        }

        return orderProcess.group_item;
    }, [orderProcess.group_item, orderProcess.snapshot]);


    const modalHandler = useModal();
    const { data } = useSession();

    const openCancelOrderProcess = (orderProcess: OrderProcess) => {
        const onClose = () => {
            modalHandler.hideModal("order-process-cancel-" + orderProcess.id)
        }

        modalHandler.showModal("order-process-cancel-" + orderProcess.id, "Cancelar Pedido " + orderProcess.order_number,
            <CancelOrderProcess orderProcess={orderProcess} />,
            'lg',
            onClose
        )
    }

    return (
        <div className="space-y-5">
            {/* Group Observation */}
            {groupItem?.observation && (
                <div className="bg-red-100 border border-red-100/50 rounded-lg p-2 shadow-sm">
                    <div className="flex items-center gap-1.5 text-red-500 mb-1">
                        <MessageSquare size={14} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Obs</span>
                        <p className="text-red-950 text-[13px] font-medium leading-tight italic">
                            "{groupItem.observation}"
                        </p>
                    </div>
                </div>
            )}

            {/* Main Items Section */}
            {groupItem?.items && groupItem.items.length > 0 && (
                <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 px-1">
                        <Package size={14} className="text-gray-400" />
                        <h3 className="font-bold text-[10px] uppercase tracking-wider text-gray-400">Itens Principais</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                        {groupItem.items.map(item => {
                            const product = orderProcess.products.find(p => p.id === item.product_id);
                            return <ItemDetails key={item.id} item={item} product={product} />;
                        })}
                    </div>
                </div>
            )}

            {/* Complement Items Section */}
            {groupItem?.complement_item && (
                <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 px-1">
                        <Layers size={14} className="text-indigo-400" />
                        <h3 className="font-bold text-[10px] uppercase tracking-wider text-indigo-500">Acompanhamento</h3>
                    </div>
                    <div className="bg-indigo-50/10 p-2 rounded-xl border border-indigo-100 border-dashed">
                        <ItemDetails
                            key={groupItem.complement_item.id}
                            item={groupItem.complement_item}
                            isComplement={true}
                        />
                    </div>
                </div>
            )}

            {/* Summary Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50/50 rounded-xl p-3 mt-6 border border-gray-100 gap-3 sm:gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-rose-500 hover:text-rose-900 w-full sm:w-auto justify-center"
                    onClick={() => openCancelOrderProcess(orderProcess)}
                >
                    <X className="w-4 h-4 mr-1.5" />
                    <span className="text-xs font-bold">Cancelar item</span>
                </Button>

                <Badge variant="outline" className="h-5 px-1.5 bg-white border-gray-200 text-[10px] font-bold text-gray-500 shadow-none w-full sm:w-auto py-3 sm:py-0 justify-center">
                    Total de itens: <span className="ml-1 text-gray-900 font-extrabold">{groupItem?.quantity}</span>
                </Badge>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-gray-500 hover:text-gray-900 w-full sm:w-auto justify-center"
                    onClick={() => groupItem && data && printGroupItem({ groupItemID: groupItem.id, session: data })}
                    disabled={!groupItem}
                >
                    <Printer className="w-4 h-4 mr-1.5" />
                    <span className="text-xs font-bold">Imprimir</span>
                </Button>
            </div>
        </div>
    );
};

export default OrderProcessDetails;
