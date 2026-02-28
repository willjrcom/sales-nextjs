"use client";

import React, { CSSProperties, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import PageTitle from "@/app/components/ui/page-title";
import PlaceTable from "@/app/entities/place/place_table";
import { SelectField, TextField } from "@/app/components/modal/field";
import RequestError from "@/app/utils/error";
import { useModal } from "@/app/context/modal/context";
import CardOrder from "@/app/components/card-order/card-order";
import OrderTable from "@/app/entities/order/order-table";
import { Plus, List, Table as TableIcon, Clock, Users, ChevronRight, AlertCircle } from "lucide-react";
import NewOrderTable from "@/app/api/order-table/new/order-table";
import { useRouter } from "next/navigation";
import { notifyError } from "@/app/utils/notifications";
import { useQuery } from '@tanstack/react-query';
import GetPlaces from '@/app/api/place/place';
import GetOrderTables from '@/app/api/order-table/order-table';
import ThreeColumnHeader from "@/components/header/three-column-header";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import PatternField from "@/app/components/modal/fields/pattern";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Sidebar listing active tables and showing elapsed usage time
const SidebarActiveTables = ({ orders }: { orders: OrderTable[] }) => {
    const [now, setNow] = useState<Date>(new Date());
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatElapsed = (start: string) => {
        const startDate = new Date(start);
        if (isNaN(startDate.getTime())) return "00:00";
        const diff = now.getTime() - startDate.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const activeOrders = orders.filter(o => o.name);

    return (
        <Card className="w-80 border-none shadow-xl h-fit sticky top-4 bg-white/70 backdrop-blur-sm overflow-hidden rounded-3xl">
            <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50 p-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black text-gray-800 flex items-center gap-2 tracking-tight">
                        <Users className="w-6 h-6 text-blue-600" />
                        Mesas em Uso
                    </CardTitle>
                    <Badge variant="secondary" className="bg-blue-600 text-white font-black px-2.5">
                        {activeOrders.length}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {activeOrders.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                        <div className="flex justify-center">
                            <TableIcon className="w-16 h-16 text-gray-100" />
                        </div>
                        <p className="text-sm text-gray-400 font-bold italic">Nenhuma mesa ocupada</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50 max-h-[70vh] overflow-auto scrollbar-hide">
                        {activeOrders.map(order => (
                            <div key={order.order_id} className="p-5 hover:bg-blue-50/40 transition-all group cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-black text-gray-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">
                                        {order.name}
                                    </span>
                                    <Badge variant="outline" className="text-[10px] font-mono font-bold bg-white text-gray-400 border-gray-100">
                                        #{order.order_number || order.order_id.slice(0, 4)}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 py-1 px-2.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-100 transition-colors">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-xs font-black">
                                            {formatElapsed(order.created_at || '')}
                                        </span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const INITIAL_GRID_SIZE = 5;
class GridItem { x: number = 0; y: number = 0; constructor(x: number, y: number) { this.x = x; this.y = y; } };

const generateGrid = (rows: number, cols: number) => {
    const grid = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            grid.push({ x: col, y: row });
        }
    }
    return grid;
};

const DragAndDropGrid = () => {
    const [totalRows, setTotalRows] = useState(INITIAL_GRID_SIZE);
    const [totalCols, setTotalCols] = useState(INITIAL_GRID_SIZE);
    const [grid, setGrid] = useState(generateGrid(totalRows, totalCols));
    const { data } = useSession();
    const [placeSelectedID, setPlaceSelectedID] = useState<string>("");

    const { data: placesResponse } = useQuery({
        queryKey: ['places'],
        queryFn: () => GetPlaces(data!),
        // @ts-ignore
        enabled: !!data?.user?.access_token,
        refetchInterval: 120000,
    });

    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const { isFetching, data: tableOrdersResponse, refetch } = useQuery({
        queryKey: ['table-orders'],
        queryFn: () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetOrderTables(data!);
        },
        // @ts-ignore
        enabled: !!data?.user?.access_token,
        refetchInterval: 30000,
    });

    const places = useMemo(() => placesResponse?.items || [], [placesResponse?.items]);
    const tableOrders = useMemo(() => tableOrdersResponse?.items || [], [tableOrdersResponse?.items]);

    useEffect(() => {
        if (places.length > 0 && placeSelectedID === "") {
            setPlaceSelectedID(places[0].id);
        }
    }, [places, placeSelectedID]);

    const place = useMemo(() => places.find(p => p.id === placeSelectedID), [places, placeSelectedID]);
    const droppedTables = useMemo(() => place?.tables || [], [place]);

    useEffect(() => {
        reloadGrid(droppedTables);
    }, [droppedTables]);

    const reloadGrid = (tables: PlaceTable[]) => {
        if (!tables || tables.length === 0) return;
        const xyPositions = tables.map((table) => new GridItem(table.column, table.row))
        const { maxX, maxY } = xyPositions.reduce(
            (acc, pos) => ({
                maxX: Math.max(acc.maxX, pos.x),
                maxY: Math.max(acc.maxY, pos.y),
            }),
            { maxX: 0, maxY: 0 }
        );
        setGrid(generateGrid(maxY < 5 ? 5 : maxY + 1, maxX < 5 ? 5 : maxX + 1));
        setTotalRows(maxY < 5 ? 5 : maxY + 1);
        setTotalCols(maxX < 5 ? 5 : maxX + 1);
    }

    const activeOrdersForPlace = tableOrders.filter(
        order => order.status !== "Closed"
            && droppedTables.some(dt => dt.table_id === order.table_id)
    );

    return (
        <div className="flex flex-col md:flex-row gap-8 p-6 bg-gray-50/30 min-h-screen">
            <div className="flex-1 space-y-6">
                <ThreeColumnHeader
                    center={<PageTitle title="Controle de Mesas" tooltip="Gerencie mesas e pedidos em cada local." />}
                    left={
                        <div className="w-72">
                            <SelectField friendlyName="" name="place" selectedValue={placeSelectedID} setSelectedValue={setPlaceSelectedID} values={places} optional />
                        </div>
                    }
                    right={<Refresh onRefresh={refetch} isFetching={isFetching} lastUpdate={lastUpdate} />}
                />

                {/* Grid Container com efeito de profundidade reduzido para foco na grade */}
                <div className="bg-white rounded-[32px] shadow-2xl shadow-blue-900/5 border border-gray-100 p-8 md:p-12 overflow-auto">
                    <div
                        className="mx-auto inline-grid"
                        style={{
                            gridTemplateColumns: `repeat(${totalCols}, 120px)`,
                            gridTemplateRows: `repeat(${totalRows}, 100px)`,
                            gap: "8px",
                            position: "relative",
                        }}
                    >
                        {grid.map((cell) => (
                            <Cell key={`${cell.x}-${cell.y}`}>
                                {droppedTables?.filter((item) => item.column === cell.x && item.row === cell.y)
                                    .map((placeTable) => {
                                        const ordersForTable = tableOrders.filter(
                                            (order) => order.table_id === placeTable.table_id && order.status !== "Closed"
                                        );
                                        return (
                                            <TableItem
                                                key={`${placeTable.table_id}-${placeTable.row}-${placeTable.column}`}
                                                placeTable={placeTable}
                                                ordersForTable={ordersForTable}
                                            />
                                        );
                                    })}
                            </Cell>
                        ))}
                    </div>
                </div>
            </div>
            <SidebarActiveTables orders={activeOrdersForPlace} />
        </div>
    );
};

const TableItem = ({ placeTable, ordersForTable }: { placeTable: PlaceTable, ordersForTable: OrderTable[] }) => {
    const { data } = useSession();
    const router = useRouter();
    const modalHandler = useModal();
    const [name, setName] = useState<string>("");
    const [contact, setContact] = useState<string>("");
    const [isCreating, setIsCreating] = useState(false);

    const openModal = () => {
        if (ordersForTable.length === 0) {
            const onClose = () => {
                modalHandler.hideModal("new-table")
                setIsCreating(false)
                setName("")
                setContact("")
            }
            const newOrder = async (tableID: string) => {
                if (!data || isCreating) return
                setIsCreating(true);
                try {
                    const response = await NewOrderTable(data, tableID, name, contact)
                    router.push('/pages/order-control/' + response.order_id)
                    onClose()
                } catch (error: RequestError | any) {
                    notifyError(error.message || 'Ocorreu um erro ao criar o pedido');
                    setIsCreating(false);
                }
            }
            const content = () => (
                <div className="space-y-6 pt-4">
                    <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl shadow-blue-200">
                        <div className="flex items-center gap-3 font-black text-lg mb-2">
                            <TableIcon className="w-6 h-6 border-2 border-white/30 p-1 rounded-lg" />
                            Mesa {placeTable.table.name}
                        </div>
                        <p className="text-sm font-bold text-blue-100 uppercase tracking-widest opacity-80">Iniciar Atendimento</p>
                    </div>
                    <div className="space-y-4">
                        <TextField friendlyName="Nome do Cliente (Opcional)" placeholder="Ex: Lucas Oliveira" name="name" value={name} setValue={setName} />
                        <PatternField friendlyName="Contato / WhatsApp" placeholder="(00) 00000-0000" name="contact" value={contact} setValue={setContact} patternName="full-phone" optional />
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="flex-1 rounded-2xl h-14 font-black text-gray-400 hover:text-gray-900 transition-all border-gray-100" onClick={onClose}>Cancelar</Button>
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 font-black gap-2 shadow-lg shadow-blue-200" onClick={() => newOrder(placeTable.table_id)} disabled={isCreating}>
                            {isCreating ? 'Iniciando...' : 'Confirmar'}
                            {!isCreating && <Plus className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>
            )
            modalHandler.showModal("new-table", "Novo Pedido", content(), "md", onClose);
            return
        }
        if (ordersForTable.length > 1) {
            const onClose = () => modalHandler.hideModal("select-order-" + placeTable.table_id)
            const selectOrder = (order: OrderTable) => {
                const onCloseOrder = () => modalHandler.hideModal("show-order-" + order.order_id)
                modalHandler.showModal("show-order-" + order.order_id, "Atendimento", <CardOrder orderId={order.order_id} />, "xl", onCloseOrder);
                onClose();
            }
            const orderList = () => (
                <div className="space-y-6 pt-2">
                    <div className="bg-amber-500 p-6 rounded-3xl text-white shadow-xl shadow-amber-200">
                        <div className="flex items-center gap-3 font-black text-lg">
                            <AlertCircle className="w-6 h-6" />
                            Mesa Multi-Pedido
                        </div>
                        <p className="text-sm font-bold text-amber-100 uppercase tracking-widest opacity-80 mt-1">Mesa {placeTable.table.name}</p>
                    </div>
                    <div className="space-y-3">
                        {ordersForTable.map((order) => (
                            <button key={order.order_id} onClick={() => selectOrder(order)} className="w-full text-left p-5 bg-white border-2 border-gray-50 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all group flex items-center justify-between shadow-sm">
                                <div className="space-y-1">
                                    <div className="font-black text-gray-800 group-hover:text-blue-700 transition-colors text-lg">Pedido #{order.order_number || order.order_id.slice(0, 4)}</div>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-black uppercase tracking-widest">
                                        <Clock className="w-4 h-4 text-blue-400" /> {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all"><ChevronRight className="w-6 h-6" /></div>
                            </button>
                        ))}
                    </div>
                </div>
            )
            modalHandler.showModal("select-order-" + placeTable.table_id, "Pedidos Aberto", orderList(), "md", onClose);
            return
        }
        const order = ordersForTable[0];
        const onClose = () => modalHandler.hideModal("show-order-" + order.order_id)
        modalHandler.showModal("show-order-" + order.order_id, "Gestão de Mesa", <CardOrder orderId={order.order_id} />, "xl", onClose);
    }

    const hasOrders = ordersForTable.length > 0;

    return (
        <button
            onClick={openModal}
            className={cn(
                "w-[100px] h-[80px] rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300 group shadow-lg",
                hasOrders
                    ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-200 hover:scale-105 active:scale-95"
                    : "bg-white border-2 border-dashed border-gray-200 text-gray-300 hover:border-blue-400 hover:text-blue-500 hover:scale-105 active:scale-95"
            )}
        >
            <TableIcon className={cn("w-6 h-6 mb-1 opacity-20 group-hover:opacity-100 transition-opacity", hasOrders && "opacity-80")} />
            <p className="text-xs font-black tracking-tighter uppercase leading-none">
                {placeTable?.table.name || "S/N"}
            </p>
            {hasOrders && (
                <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-black rounded-full h-8 px-2 flex items-center justify-center ring-4 ring-white shadow-xl animate-in zoom-in slide-in-from-bottom-2 duration-500">
                    {ordersForTable.length}
                </div>
            )}
        </button>
    );
};

const Cell = ({ children }: { children?: React.ReactNode }) => {
    return (
        <div className="w-[120px] h-[100px] border-2 border-gray-200/60 bg-white rounded-3xl flex items-center justify-center relative transition-colors hover:bg-blue-50/30">
            {children}
            {!children && <div className="w-1.5 h-1.5 bg-gray-200 rounded-full opacity-50" />}
        </div>
    );
};

export default DragAndDropGrid;
