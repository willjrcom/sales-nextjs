"use client";

import React, { CSSProperties, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import PageTitle from "@/app/components/PageTitle";
import PlaceTable from "@/app/entities/place/place_table";
import { SelectField } from "@/app/components/modal/field";
import RequestError from "@/app/utils/error";
import { useModal } from "@/app/context/modal/context";
import CardOrder from "@/app/components/order/card-order";
import OrderTable from "@/app/entities/order/order-table";
import { FaPlus, FaList } from "react-icons/fa";
import NewOrderTable from "@/app/api/order-table/new/order-table";
import { useRouter } from "next/navigation";
import { notifyError } from "@/app/utils/notifications";
import { useQuery } from '@tanstack/react-query';
import GetPlaces from '@/app/api/place/place';
import GetOrderTables from '@/app/api/order-table/order-table';

// Sidebar listing active tables and showing elapsed usage time
const SidebarActiveTables = ({ orders }: { orders: OrderTable[] }) => {
    const [now, setNow] = useState<Date>(new Date());
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatElapsed = (start: string) => {
        const startDate = new Date(start);
        if (isNaN(startDate.getTime())) return "--:--:--";
        const diff = now.getTime() - startDate.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const activeOrders = orders.filter(o => o.name);
    return (
        <aside className="w-64 p-4 bg-white rounded shadow ml-4">
            <h3 className="text-lg font-semibold mb-2">Mesas em uso</h3>
            {activeOrders.length === 0 ? (
                <p>Nenhuma mesa em uso</p>
            ) : (
                <ul className="space-y-2">
                    {activeOrders.map(order => (
                        <li key={order.order_id} className="flex justify-between text-sm">
                            <span>{order.name}</span>
                            <span>{formatElapsed(order.created_at || '')}</span>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
};

const INITIAL_GRID_SIZE = 5; // Tamanho inicial da grade
class GridItem { x: number = 0; y: number = 0; constructor(x: number, y: number) { this.x = x; this.y = y; } };

// Função para gerar a matriz
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
        enabled: !!data?.user?.access_token,
    });

    const { data: tableOrdersResponse } = useQuery({
        queryKey: ['table-orders'],
        queryFn: () => GetOrderTables(data!),
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

        // Encontrar o maior x (column) e maior y (row)
        const { maxX, maxY } = xyPositions.reduce(
            (acc, pos) => ({
                maxX: Math.max(acc.maxX, pos.x),
                maxY: Math.max(acc.maxY, pos.y),
            }),
            { maxX: 0, maxY: 0 } // Valores iniciais
        );

        setGrid(generateGrid(maxY < 5 ? 5 : maxY + 1, maxX < 5 ? 5 : maxX + 1));
        setTotalRows(maxY < 5 ? 5 : maxY + 1);
        setTotalCols(maxX < 5 ? 5 : maxX + 1);
    }

    // Filtra apenas pedidos ativos (não fechados) das mesas do local selecionado
    const activeOrdersForPlace = tableOrders.filter(
        order => order.status !== "Closed"
            && droppedTables.some(dt => dt.table_id === order.table_id)
    );

    return (
        <div className="flex p-2">
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <PageTitle title="Controle de Mesas" tooltip="Gerencie mesas e pedidos em cada local." />
                    <SelectField friendlyName="" name="place" selectedValue={placeSelectedID} setSelectedValue={setPlaceSelectedID} values={places}
                        optional />
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${totalCols - 1}, 100px) auto`,
                        gridTemplateRows: `repeat(${totalRows}, 80px) auto`,
                        gap: "3px",
                        position: "relative",
                        backgroundColor: "#f4f4f4",
                        padding: "10px",
                    }}
                >
                    {/* Células da grade */}
                    {grid.map((cell) => (
                        <Cell key={`${cell.x}-${cell.y}`}>
                            {droppedTables?.filter((item) => item.column === cell.x && item.row === cell.y)
                                .map((placeTable) => {
                                    // Buscar todos os pedidos abertos para esta mesa
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
            <SidebarActiveTables orders={activeOrdersForPlace} />
        </div>
    );
};

const TableItem = ({ placeTable, ordersForTable }: { placeTable: PlaceTable, ordersForTable: OrderTable[] }) => {
    const { data } = useSession();
    const router = useRouter();
    const modalHandler = useModal();
    const style = {
        width: "80px",
        height: "60px",
        zIndex: 1000,
    };

    const openModal = () => {
        // Se não há pedidos, criar novo pedido
        if (ordersForTable.length === 0) {
            const onClose = () => {
                modalHandler.hideModal("new-table")
            }

            const newOrder = async (tableID: string) => {
                if (!data) return
                try {
                    const response = await NewOrderTable(tableID, data)
                    router.push('/pages/order-control/' + response.order_id)
                    onClose()
                } catch (error: RequestError | any) {
                    notifyError(error.message || 'Ocorreu um erro ao criar o pedido');
                }
            }

            const button = () => (
                <>
                    <p className="mb-4"><strong>Mesa:</strong> {placeTable.table.name}</p>
                    <p className="mb-4">Deseja iniciar um novo pedido?</p>
                    <button onClick={() => newOrder(placeTable.table_id)} className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                        <FaPlus />
                        <span>Iniciar</span>
                    </button>
                </>
            )

            modalHandler.showModal("new-table", "Nova mesa", button(), "md", onClose);
            return
        }

        // Se há múltiplos pedidos, mostrar lista de seleção
        if (ordersForTable.length > 1) {
            const onClose = () => {
                modalHandler.hideModal("select-order-" + placeTable.table_id)
            }

            const selectOrder = (order: OrderTable) => {
                const onCloseOrder = () => {
                    modalHandler.hideModal("show-order-" + order.order_id)
                }
                modalHandler.showModal("show-order-" + order.order_id, "Editar mesa", <CardOrder orderId={order.order_id} />, "xl", onCloseOrder);
                onClose();
            }

            const orderList = () => (
                <div className="w-full max-w-md bg-white p-6 rounded-md shadow space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Mesa: {placeTable.table.name}</h2>
                    <p className="text-gray-600 mb-4">Existem {ordersForTable.length} pedidos abertos nesta mesa. Escolha qual deseja visualizar:</p>

                    <div className="space-y-2">
                        {ordersForTable.map((order) => (
                            <button
                                key={order.order_id}
                                onClick={() => selectOrder(order)}
                                className="w-full p-3 text-left border border-gray-300 rounded-md hover:bg-gray-50 hover:border-blue-500 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">Pedido #{order.order_number || order.order_id.slice(0, 8)}</p>
                                        <p className="text-sm text-gray-600">Criado em: {new Date(order.created_at).toLocaleString()}</p>
                                    </div>
                                    <FaList className="text-gray-400" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )

            modalHandler.showModal("select-order-" + placeTable.table_id, "Selecionar Pedido", orderList(), "md", onClose);
            return
        }

        // Se há apenas um pedido, abrir diretamente
        const order = ordersForTable[0];
        const onClose = () => {
            modalHandler.hideModal("show-order-" + order.order_id)
        }

        modalHandler.showModal("show-order-" + order.order_id, "Editar mesa", <CardOrder orderId={order.order_id} />, "xl", onClose);
    }

    const hasOrders = ordersForTable.length > 0;
    const hasMultipleOrders = ordersForTable.length > 1;

    return (
        <div
            onClick={openModal}
            style={{
                ...style,
                backgroundColor: hasOrders ? "lightgreen" : "lightblue",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
            }}
        >
            <p className="text-sm">{placeTable?.table.name || "Sem Nome"}</p>
            {hasMultipleOrders && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {ordersForTable.length}
                </div>
            )}
        </div>
    );
};

// Componente Droppable (células da mesa)
const Cell = ({ children }: { children?: React.ReactNode }) => {
    const style: CSSProperties = {
        border: "1px dashed #ccc",
        width: "100px",
        height: "80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    };

    return (
        <div style={style}>
            {children}
        </div>
    );
};

export default DragAndDropGrid;
