import { useModal } from "../../../../../../context/modal/context";
import OrderProcess from "../../../../../../entities/order-process/order-process";
import { ToUtcTimeWithSeconds } from "../../../../../../utils/date";
import CancelOrderProcess from "./cancel-process-order";
import ItemDetails from "./item-details";
import { Printer, MessageSquare, Package, Layers, Hash } from "lucide-react";
import { Button } from "../../../../../../../components/ui/button";
import { Badge } from "../../../../../../../components/ui/badge";
import { Separator } from "../../../../../../../components/ui/separator";
import printGroupItem from "../../../../../../components/print/print-group-item";
import { useSession } from "next-auth/react";

interface OrderProcessDetailsProps {
    orderProcess: OrderProcess;
}

const OrderProcessDetails = ({ orderProcess }: OrderProcessDetailsProps) => {
    const groupItem = orderProcess.group_item;
    const modalHandler = useModal();
    const { data } = useSession();

    const openCancelOrderProcess = (orderProcess: OrderProcess) => {
        const onClose = () => {
            modalHandler.hideModal("order-process-cancel-" + orderProcess.id)
        }

        modalHandler.showModal("order-process-cancel-" + orderProcess.id, "# " + orderProcess.id,
            <CancelOrderProcess orderProcess={orderProcess} />,
            'lg',
            onClose
        )
    }

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div className="flex justify-between items-center bg-gray-50 -mx-6 -mt-6 p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                        <Hash className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-900">Detalhes do Pedido {orderProcess.order_number}</h2>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white shadow-sm hover:bg-gray-50"
                        onClick={() => groupItem && data && printGroupItem({ groupItemID: groupItem.id, session: data })}
                        disabled={!groupItem}
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir
                    </Button>
                </div>
            </div>

            {/* Group Observation */}
            {groupItem?.observation && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 shadow-inner">
                    <div className="flex items-center gap-2 text-amber-600 mb-2">
                        <MessageSquare size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Observação do Grupo</span>
                    </div>
                    <p className="text-amber-900 text-sm font-medium leading-relaxed italic">
                        "{groupItem.observation}"
                    </p>
                </div>
            )}

            {/* Main Items Section */}
            {groupItem?.items && groupItem.items.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2">
                        <Package size={18} className="text-gray-400" />
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">Itens Principais</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {groupItem.items.map(item => {
                            const product = orderProcess.products.find(p => p.id === item.product_id);
                            return <ItemDetails key={item.id} item={item} product={product} />;
                        })}
                    </div>
                </div>
            )}

            {/* Complement Items Section */}
            {groupItem?.complement_item && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2">
                        <Layers size={18} className="text-indigo-400" />
                        <h3 className="font-bold text-sm uppercase tracking-wider text-indigo-500">Acompanhamento / Complemento</h3>
                    </div>
                    <div className="bg-indigo-50/20 p-4 rounded-2xl border border-indigo-100 border-dashed">
                        <ItemDetails
                            key={groupItem.complement_item.id}
                            item={groupItem.complement_item}
                            isComplement={true}
                        />
                    </div>
                </div>
            )}

            {/* Summary Footer */}
            <div className="bg-gray-50 rounded-2xl p-6 mt-10 border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="order-2 sm:order-1">
                    <button
                        className="flex items-center justify-center gap-2 bg-rose-50 text-rose-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-rose-100 transition-colors border border-rose-100"
                        onClick={() => openCancelOrderProcess(orderProcess)}
                    >
                        ✖ Cancelar item
                    </button>
                </div>
                <div className="flex items-center gap-4 bg-white p-4 px-6 rounded-xl border border-gray-100 shadow-sm order-1 sm:order-2 w-full sm:w-auto justify-center">
                    <span className="text-gray-500 font-medium text-sm">Quantidade Total:</span>
                    <Badge variant="secondary" className="text-xl py-1 px-4 bg-gray-100 text-gray-900 font-black border-2 border-white">
                        {groupItem?.quantity}
                    </Badge>
                </div>
            </div>
        </div>
    );
};

export default OrderProcessDetails;
