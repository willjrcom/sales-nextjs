"use client";

import React, { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import PageTitle from '@/app/components/ui/page-title';
import { DndContext, useDroppable, useDraggable, DragOverlay, defaultDropAnimationSideEffects, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useSession } from "next-auth/react";
import PlaceTable from "@/app/entities/place/place_table";
import { SelectField } from "@/app/components/modal/field";
import RequestError from "@/app/utils/error";
import Table from "@/app/entities/table/table";
import AddTableToPlace from "@/app/api/place/table/add/place";
import RemoveTableFromPlace from "@/app/api/place/table/remove/place";
import TableForm from "@/app/forms/table/form";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { notifyError } from "@/app/utils/notifications";
import { useModal } from "@/app/context/modal/context";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import GetPlaces from '@/app/api/place/place';
import GetUnusedTables from '@/app/api/table/unused/table';
import { LayoutGrid, Plus, Minus, Edit, Table as TableIcon, GripVertical, Trash2, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

const PageDragAndDropGrid = () => {
    const [totalRows, setTotalRows] = useState(INITIAL_GRID_SIZE);
    const [totalCols, setTotalCols] = useState(INITIAL_GRID_SIZE);
    const [grid, setGrid] = useState(generateGrid(totalRows, totalCols));
    const [unusedTables, setUnusedTables] = useState<Table[]>([]);
    const [droppedTables, setDroppedTables] = useState<PlaceTable[]>([]);
    const { data } = useSession();
    const [placeSelectedID, setPlaceSelectedID] = useState<string>("");
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const queryClient = useQueryClient();
    const lastLoadedPlaceID = useRef<string>("");

    // Estados para Drag and Drop
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeData, setActiveData] = useState<any>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const { data: placesResponse, refetch: refetchPlaces, isFetching } = useQuery({
        queryKey: ['places'],
        queryFn: () => GetPlaces(data!),
        // @ts-ignore
        enabled: !!data?.user?.access_token,
    });

    const { data: unusedTablesResponse, refetch: refetchUnusedTables } = useQuery({
        queryKey: ['unused-tables'],
        queryFn: () => GetUnusedTables(data!),
        // @ts-ignore
        enabled: !!data?.user?.access_token,
    });

    const handleRefresh = async () => {
        await Promise.all([refetchPlaces(), refetchUnusedTables()]);
        setLastUpdate(FormatRefreshTime(new Date()));
    };

    const places = useMemo(() => placesResponse?.items || [], [placesResponse?.items]);

    useEffect(() => {
        if (places.length > 0 && placeSelectedID === "") {
            setPlaceSelectedID(places[0].id);
        }
    }, [places, placeSelectedID]);

    useEffect(() => {
        setUnusedTables(unusedTablesResponse?.items || []);
    }, [unusedTablesResponse?.items]);

    const place = useMemo(() => places.find((p: any) => p.id === placeSelectedID), [places, placeSelectedID]);

    useEffect(() => {
        setDroppedTables(place?.tables || []);
        if (lastLoadedPlaceID.current !== placeSelectedID) {
            reloadGrid(place?.tables || []);
            lastLoadedPlaceID.current = placeSelectedID;
        }
    }, [place]);

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

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
        setActiveData(event.active.data.current);
    };

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveData(null);

        if (over) {
            if (over.id === "unused-tables" && active.id.endsWith("-unused")) return
            if (over.id === "unused-tables") {
                const placeTable = active.data.current as PlaceTable
                const table = placeTable.table as Table
                const newDroppedTables = [...droppedTables || []].filter((item) => item.table_id !== active.id)
                const newUnusedTables = [...unusedTables, { ...table }]
                if (!data) return
                try {
                    await RemoveTableFromPlace(table.id, data)
                } catch (error: RequestError | any) {
                    notifyError(error.message || 'Ocorreu um erro ao remover mesa');
                    return
                }
                setDroppedTables(newDroppedTables);
                setUnusedTables(newUnusedTables);
                queryClient.invalidateQueries({ queryKey: ['places'] });
                queryClient.invalidateQueries({ queryKey: ['unused-tables'] });
                return
            }
            if (active.id.endsWith("-unused") && over.id !== "unused-tables") {
                if (placeSelectedID === "") return
                const table = active.data.current as Table;
                const [x, y] = over.id.split("-").map(Number);
                const placeTable = { table: table, table_id: table.id, column: x, row: y, place_id: placeSelectedID } as PlaceTable;
                const newUnusedTables = unusedTables.filter((item) => item.id !== table.id)
                const newDroppedTables = [...droppedTables || [], placeTable]
                if (!data) return
                try {
                    await AddTableToPlace(placeTable, data)
                } catch (error: RequestError | any) {
                    notifyError(error.message || "Erro ao alocar mesa")
                    return
                }
                setUnusedTables(newUnusedTables);
                setDroppedTables(newDroppedTables);
                queryClient.invalidateQueries({ queryKey: ['places'] });
                queryClient.invalidateQueries({ queryKey: ['unused-tables'] });
                return
            }
            if (active.id !== over.id) {
                const [x, y] = over.id.split("-").map(Number);
                const tables = [...droppedTables || []].filter((item) => item.table_id !== active.id)
                const placeTable = { ...active.data.current, row: y, column: x } as PlaceTable;
                tables.push(placeTable);
                const newDroppedTables = [...[...droppedTables || []].filter((item) => item.table_id !== active.id), placeTable]
                if (!data) return
                try {
                    await AddTableToPlace(placeTable, data)
                } catch (error: RequestError | any) {
                    notifyError(error.message || "Erro ao mover mesa")
                    return
                }
                queryClient.invalidateQueries({ queryKey: ['places'] });
                queryClient.invalidateQueries({ queryKey: ['unused-tables'] });
                setDroppedTables(newDroppedTables);
                return
            }
        }
    };

    const addRow = () => {
        setGrid(generateGrid(totalRows + 1, totalCols));
        setTotalRows((prev) => prev + 1);
    };

    const removeRow = () => {
        if (totalRows <= 5) {
            notifyError("Mínimo de 5 linhas");
            return;
        }
        const lastRowUsed = [...droppedTables || []].find((item) => item.row === totalRows - 1);
        if (lastRowUsed) {
            notifyError("Remova a mesa desta linha primeiro");
            return;
        }
        setGrid(generateGrid(totalRows - 1, totalCols));
        setTotalRows((prev) => prev - 1);
    };

    const addColumn = () => {
        setGrid(generateGrid(totalRows, totalCols + 1));
        setTotalCols((prev) => prev + 1);
    };

    const removeColumn = () => {
        if (totalCols <= 5) {
            notifyError("Mínimo de 5 colunas");
            return;
        }
        const lastColumnUsed = [...droppedTables || []].find((item) => item.column === totalCols - 1);
        if (lastColumnUsed) {
            notifyError("Remova a mesa desta coluna primeiro");
            return;
        }
        setGrid(generateGrid(totalRows, totalCols - 1));
        setTotalCols((prev) => prev - 1);
    };

    return (
        <div className="p-4 space-y-6 bg-gray-50/30 min-h-screen">
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex flex-col xl:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                        <Card className="border-none shadow-xl bg-white overflow-hidden rounded-3xl">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between p-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                                            <Layers className="w-6 h-6" />
                                        </div>
                                        <CardTitle className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                                            Organização de Layout
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-12">
                                        Arraste as mesas para posicionar no salão
                                    </CardDescription>
                                </div>
                                <div className="w-72">
                                    <SelectField
                                        friendlyName="Ambiente"
                                        name="place"
                                        selectedValue={placeSelectedID}
                                        setSelectedValue={setPlaceSelectedID}
                                        values={places}
                                        optional
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-10 relative overflow-auto bg-gray-50">
                                <div
                                    className="mx-auto inline-grid p-4 bg-white border border-gray-200 rounded-2xl shadow-sm relative z-0"
                                    style={{
                                        gridTemplateColumns: `repeat(${totalCols}, 120px)`,
                                        gridTemplateRows: `repeat(${totalRows}, 100px)`,
                                        gap: "4px",
                                    }}
                                >
                                    {grid.map((cell) => (
                                        <DroppableCell key={`${cell.x}-${cell.y}`} id={`${cell.x}-${cell.y}`}>
                                            {droppedTables?.filter((item) => item.column === cell.x && item.row === cell.y)
                                                .map((item) => (
                                                    <DraggablePlaceToTable key={`${item.table_id}-${item.row}-${item.column}`} id={item.table_id} table={item} activeId={activeId} />
                                                ))}
                                        </DroppableCell>
                                    ))}
                                </div>

                                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                                    <Button size="icon" variant="outline" className="rounded-full shadow-md bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50" onClick={addColumn}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="outline" className="rounded-full shadow-md bg-white text-amber-600 border-amber-100 hover:bg-amber-50" onClick={removeColumn}>
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                    <Badge variant="outline" className="bg-white/90 text-gray-400 font-mono text-[10px] py-0 px-2 h-5 self-center">
                                        {totalCols} COL
                                    </Badge>
                                </div>

                                <div className="mt-8 flex justify-center gap-4">
                                    <Button size="icon" variant="outline" className="rounded-full shadow-md bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50" onClick={addRow}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="outline" className="rounded-full shadow-md bg-white text-amber-600 border-amber-100 hover:bg-amber-50" onClick={removeRow}>
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                    <Badge variant="outline" className="bg-white/90 text-gray-400 font-mono text-[10px] py-0 px-2 h-5 flex items-center">
                                        {totalRows} LIN
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="w-full xl:w-80 border-none shadow-xl bg-white rounded-3xl overflow-hidden self-start">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                                    <TableIcon className="w-5 h-5 text-gray-400" />
                                    Disponíveis
                                </CardTitle>
                                <Refresh onRefresh={handleRefresh} isFetching={isFetching} lastUpdate={lastUpdate} />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <DroppableColumn key="unused-tables" id="unused-tables">
                                {unusedTables.length === 0 ? (
                                    <div className="w-full py-16 text-center space-y-4">
                                        <div className="flex justify-center">
                                            <TableIcon className="w-12 h-12 text-gray-100" />
                                        </div>
                                        <p className="text-xs font-bold text-gray-300 italic">Nenhuma mesa disponível</p>
                                    </div>
                                ) : (
                                    <div className="p-4 grid grid-cols-2 xl:grid-cols-1 gap-3 w-full">
                                        {unusedTables.map((item) => (
                                            <DraggableUnusedTable key={`${item.id}-unused`} id={`${item.id}-unused`} table={item} activeId={activeId} />
                                        ))}
                                    </div>
                                )}
                            </DroppableColumn>
                        </CardContent>
                    </Card>
                </div>

                <DragOverlay dropAnimation={null}>
                    {activeId ? (
                        <div className="w-[100px] h-[80px] bg-blue-600 text-white rounded-2xl flex flex-col items-center justify-center p-2 shadow-2xl scale-110 opacity-90 border-2 border-white cursor-grabbing">
                            <TableIcon className="w-5 h-5 mb-1" />
                            <p className="text-xs font-black uppercase tracking-tighter">
                                {activeData?.name || activeData?.table?.name || "Mesa"}
                            </p>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

const DraggablePlaceToTable = ({ id, table, activeId }: { id: string; table: PlaceTable; activeId: string | null }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data: table, });
    const isThisActive = activeId === id;

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn(
                "w-[100px] h-[80px] bg-white border-2 border-blue-500/20 rounded-2xl flex flex-col items-center justify-center p-2 relative shadow-md transition-all group cursor-grab active:cursor-grabbing",
                isDragging && "opacity-0"
            )}
        >
            <TableIcon className="w-5 h-5 text-blue-500/40 mb-1" />
            <p className="text-xs font-black text-blue-700 uppercase tracking-tighter">
                {table?.table.name || "S/Nome"}
            </p>
        </div>
    );
};

const DraggableUnusedTable = ({ id, table, activeId }: { id: string; table: Table; activeId: string | null }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data: table, });
    const modalHandler = useModal();

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        modalHandler.showModal(
            `edit-table-${table.id}`,
            `Mesa ${table.name}`,
            <TableForm item={table} isUpdate />,
            'md',
            () => modalHandler.hideModal(`edit-table-${table.id}`)
        );
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn(
                "group relative h-14 bg-white border border-gray-100 rounded-2xl px-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
                isDragging && "opacity-0"
            )}
        >
            <div className="flex items-center gap-3">
                <TableIcon className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                <span className="font-black text-gray-700 tracking-tight group-hover:text-blue-700">
                    {table?.name || "Sem Nome"}
                </span>
            </div>

            <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleEdit}
                className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
            >
                <Edit className="w-4 h-4" />
            </button>
        </div>
    );
};

const DroppableCell = ({ id, children }: { id: string; children?: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "w-[120px] h-[100px] border-2 border-gray-200/60 bg-white rounded-2xl flex items-center justify-center relative transition-all",
                isOver ? "bg-emerald-50 border-emerald-400 border-dashed" : "hover:border-blue-300 hover:bg-blue-50/30"
            )}
        >
            {children}
            {!children && <div className="w-1.5 h-1.5 bg-gray-200 rounded-full opacity-50" />}
        </div>
    );
};

const DroppableColumn = ({ id, children }: { id: string; children?: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "min-h-[400px] xl:min-h-[60vh] w-full transition-all duration-300 rounded-b-3xl relative p-4",
                isOver && "bg-red-50/50 ring-2 ring-inset ring-red-100"
            )}
        >
            {children}
        </div>
    );
};

export default PageDragAndDropGrid;
