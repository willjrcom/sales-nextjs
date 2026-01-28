import { useState } from "react"
import PendingOrder from "@/app/api/order/status/pending/order"
import RequestError from "@/app/utils/error"
import StatusComponent from "../../../../../components/button/show-status"
import PriceField from "../../../../../components/modal/fields/price"
import UpdateChangeOrderDelivery from "@/app/api/order-delivery/update/change/order-delivery"
import { SelectField } from "../../../../../components/modal/field"
import { payMethodsWithId } from "@/app/entities/order/order-payment"
import Decimal from 'decimal.js';
import printOrder from "../../../../../components/print/print-order";
import printGroupItem from "../../../../../components/print/print-group-item";
import AddTableTax from "@/app/api/order-table/update/add-tax/order-table";
import RemoveTableTax from "@/app/api/order-table/update/remove-tax/order-table";
import GetCompany from "@/app/api/company/company";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button";
import { Truck, UtensilsCrossed } from "lucide-react";
import Order from "@/app/entities/order/order";

export default function OrderPaymentsResume() {
    const { data } = useSession();
    const queryClient = useQueryClient();
    const order = queryClient.getQueryData<Order>(['order', 'current']);

    const { data: company } = useQuery({
        queryKey: ['company'],
        queryFn: () => GetCompany(data!),
        enabled: !!data?.user?.access_token,
    })

    const [change, setChange] = useState<Decimal>(new Decimal(order?.delivery?.change || 0));
    const [paymentMethod, setPaymentMethod] = useState<string>(order?.delivery?.payment_method || "");

    const onSubmit = async () => {
        if (!order || !data) return

        try {
            await PendingOrder(order.id, data)

            if (company?.preferences.enable_print_order_on_pend_order) {
                await printOrder({
                    orderID: order.id,
                    session: data
                })
            }

            for (let i = 0; i < order.group_items.length; i++) {
                const groupItem = order.group_items[i];

                if (groupItem.need_print && groupItem.status == "Staging") {
                    await printGroupItem({
                        groupItemID: groupItem.id,
                        printerName: groupItem.printer_name,
                        session: data
                    })
                }
            }

            // Invalidar query de pedidos em staging para atualizar o topbar
            queryClient.invalidateQueries({ queryKey: ['order', 'current'] });
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao lançar pedido");
        }
    }

    const updateChange = async () => {
        if (!order || !order.delivery || !data) return

        try {
            await UpdateChangeOrderDelivery(order.delivery.id, change.toNumber(), paymentMethod, data)
            queryClient.invalidateQueries({ queryKey: ['order', 'current'] });
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao atualizar troco");
        }
    }

    // adiciona taxa usando endpoint order-table
    const handleAddTax = async () => {
        if (!order || !order.table || !data) return;
        try {
            await AddTableTax(order.table.id, data);
            notifySuccess("Taxa adicionada com sucesso");
            queryClient.invalidateQueries({ queryKey: ['order', 'current'] });
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao adicionar taxa");
        }
    };
    // remove taxa usando endpoint order-table
    const handleRemoveTax = async () => {
        if (!order || !order.table || !data) return;
        try {
            await RemoveTableTax(order.table.id, data);
            notifySuccess("Taxa removida com sucesso");
            queryClient.invalidateQueries({ queryKey: ['order', 'current'] });
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao remover taxa");
        }
    };

    const isStatusStagingOrPendingOrReady = order?.status == "Staging" || order?.status == "Pending" || order?.status == "Ready"
    const haveGroups = order && order?.group_items?.length > 0
    const isAnyGroupsStaging = haveGroups && order?.group_items?.some((group) => group.status == "Staging")
    const isThrowButton = isStatusStagingOrPendingOrReady && isAnyGroupsStaging;
    const totalPayableDecimal = new Decimal(order?.total_payable || "0");
    const deliveryTaxDecimal = new Decimal((order?.delivery?.delivery_tax || "0"))
    const tableTaxDecimal = new Decimal((order?.table?.tax_rate || "0"))

    return (
        <div className="space-y-4">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">Status do Pedido</h3>
                    {order?.status && <StatusComponent status={order?.status} />}
                </div>
                <p className="text-sm text-gray-500">
                    {order?.group_items?.length || 0} item(ns) no pedido
                </p>
            </div>

            {/* Delivery Payment Section */}
            {order?.delivery && (
                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Truck className="h-4 w-4 text-green-600" />
                        Pagamento na Entrega
                    </h4>
                    <div className="space-y-3">
                        <PriceField friendlyName="Troco para" name="change" value={change} setValue={setChange} optional />
                        <SelectField friendlyName="Forma de pagamento" name="payment_method" values={payMethodsWithId} selectedValue={paymentMethod} setSelectedValue={setPaymentMethod} optional />

                        {(change.toNumber() !== (new Decimal(order.delivery.change || "0").toNumber() || 0) || paymentMethod !== order.delivery.payment_method) && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
                                onClick={updateChange}
                            >
                                Salvar alterações
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Table Tax Section */}
            {order?.table && (
                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                <UtensilsCrossed className="h-4 w-4 text-blue-600" />
                                Taxa de Serviço
                            </h4>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {tableTaxDecimal.toFixed(0)}%
                            </p>
                        </div>
                        {tableTaxDecimal.gt(0) ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                                onClick={handleRemoveTax}
                            >
                                Remover
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-300 hover:bg-green-50"
                                onClick={handleAddTax}
                            >
                                Adicionar
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Total Section */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg p-4 text-white">
                <div className="space-y-2">
                    {order?.delivery?.delivery_tax && (
                        <div className="flex justify-between text-sm text-gray-300">
                            <span>Taxa de entrega</span>
                            {order.delivery.is_delivery_free ? (
                                <div className="flex items-center gap-2">
                                    <span className="line-through text-gray-500">
                                        R$ {deliveryTaxDecimal.toFixed(2)}
                                    </span>
                                    <span className="text-green-400 font-medium">Grátis!</span>
                                </div>
                            ) : (
                                <span>R$ {deliveryTaxDecimal.toFixed(2)}</span>
                            )}
                        </div>
                    )}

                    <div className="border-t border-gray-700 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Total a pagar</span>
                            <span className="text-3xl font-bold">
                                R$ {totalPayableDecimal.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Launch Order Button */}
            {isThrowButton && (
                <Button
                    className="w-full h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold text-lg shadow-lg"
                    onClick={onSubmit}
                >
                    🚀 Lançar Pedido
                </Button>
            )}
        </div>
    )
}
