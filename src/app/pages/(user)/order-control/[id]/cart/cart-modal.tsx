
import { ShoppingCart, X } from "lucide-react";
import Decimal from "decimal.js";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import GroupItem from "@/app/entities/order/group-item";
import EditGroupItem from "../group-item/edit-group-item";
import { useMemo } from "react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";

export default function CartModal() {
    const queryClient = useQueryClient();
    const groupItem = queryClient.getQueryData<GroupItem | null>(['group-item', 'current']);
    const itemCount = useMemo(() => groupItem?.items?.length || 0, [groupItem?.items]);
    const total = useMemo(() => new Decimal(groupItem?.total_price || "0").toFixed(2), [groupItem?.total_price]);

    return (
        <Drawer direction="right">
            <DrawerTrigger asChild>
                <Button
                    variant="default"
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white gap-2">
                    <div className="relative">
                        <ShoppingCart className="h-4 w-4" />
                        {itemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px]">
                                {itemCount}
                            </span>
                        )}
                    </div>
                    <span>Carrinho</span>
                </Button>
            </DrawerTrigger>
            <DrawerContent direction="right" className="w-[450px]">
                <DrawerHeader className="border-b bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-tl-[10px]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="h-5 w-5" />
                            <div>
                                <DrawerTitle className="text-white text-lg">
                                    Carrinho
                                </DrawerTitle>
                                <p className="text-yellow-100 text-sm">
                                    {itemCount} item(ns) • R$ {total}
                                </p>
                            </div>
                        </div>
                        <DrawerClose asChild>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-yellow-600/50">
                                <X className="h-5 w-5" />
                            </Button>
                        </DrawerClose>
                    </div>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto">
                    <EditGroupItem />
                </div>
            </DrawerContent>
        </Drawer>
    );
};