"use client";

import DeliveryCard from "../type/delivery-card"
import PickupCard from "../type/pickup-card"
import TableCard from "../type/table-card"
import { Button } from "@/components/ui/button";
import { Receipt, X, Truck, Package, UtensilsCrossed } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Order from "@/app/entities/order/order";
import OrderPaymentsResume from "./payments";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";


export default function CardOrderResume() {
    const queryClient = useQueryClient();
    const order = queryClient.getQueryData<Order>(['order', 'current']);

    const getOrderTypeIcon = () => {
        if (order?.delivery) return <Truck className="h-4 w-4" />;
        if (order?.pickup) return <Package className="h-4 w-4" />;
        if (order?.table) return <UtensilsCrossed className="h-4 w-4" />;
        return <Receipt className="h-4 w-4" />;
    };

    const getOrderTypeName = () => {
        if (order?.delivery) return "Delivery";
        if (order?.pickup) return "Retirada";
        if (order?.table) return `Mesa ${order.table.name}`;
        return "Pedido";
    };

    return (
        <Drawer direction="right">
            <DrawerTrigger asChild>
                <Button
                    variant="default"
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm flex items-center gap-2"
                >
                    <Receipt className="h-4 w-4" />
                    Resumo
                </Button>
            </DrawerTrigger>
            <DrawerContent direction="right" className="w-[420px]">
                <DrawerHeader className="border-b bg-gradient-to-r from-green-500 to-green-600 text-white rounded-tl-[10px]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {getOrderTypeIcon()}
                            <div>
                                <DrawerTitle className="text-white text-lg">
                                    Resumo do Pedido
                                </DrawerTitle>
                                <p className="text-green-100 text-sm">
                                    {getOrderTypeName()} • #{order?.order_number || "—"}
                                </p>
                            </div>
                        </div>
                        <DrawerClose asChild>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-green-700/50">
                                <X className="h-5 w-5" />
                            </Button>
                        </DrawerClose>
                    </div>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <OrderPaymentsResume />
                    {order?.delivery && <DeliveryCard />}
                    {order?.pickup && <PickupCard />}
                    {order?.table && <TableCard />}
                </div>
            </DrawerContent>
        </Drawer>
    );
};
