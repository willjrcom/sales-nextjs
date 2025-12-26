"use client";

import React, { CSSProperties, useEffect, useMemo, useState } from "react";
import PageTitle from '@/app/components/PageTitle';
import { DndContext, useDroppable, useDraggable } from "@dnd-kit/core";
import { useSession } from "next-auth/react";
import PlaceTable from "@/app/entities/place/place_table";
import { SelectField } from "@/app/components/modal/field";
import RequestError from "@/app/utils/error";
import Table from "@/app/entities/table/table";
import AddTableToPlace from "@/app/api/place/table/add/place";
import RemoveTableFromPlace from "@/app/api/place/table/remove/place";
import PlaceForm from "@/app/forms/place/form";
import TableForm from "@/app/forms/table/form";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { notifyError } from "@/app/utils/notifications";
import { useModal } from "@/app/context/modal/context";
import { FaEdit } from "react-icons/fa";
import ButtonIconText from "@/app/components/button/button-icon-text";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import GetPlaces from '@/app/api/place/place';
import GetUnusedTables from '@/app/api/table/unused/table';

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
    const [unusedTables, setUnusedTables] = useState<Table[]>([]);
    const [droppedTables, setDroppedTables] = useState<PlaceTable[]>([]);
    const { data } = useSession();
    const [placeSelectedID, setPlaceSelectedID] = useState<string>("");
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const queryClient = useQueryClient();

    const { data: placesResponse, refetch: refetchPlaces, isPending: isPendingPlaces } = useQuery({
        queryKey: ['places'],
        queryFn: () => GetPlaces(data!),
        enabled: !!data?.user?.access_token,
    });

    const { data: unusedTablesResponse, refetch: refetchUnusedTables } = useQuery({
        queryKey: ['unusedTables'],
        queryFn: () => GetUnusedTables(data!),
        enabled: !!data?.user?.access_token,
    });

    const handleRefresh = async () => {
        await Promise.all([refetchPlaces(), refetchUnusedTables()]);
        setLastUpdate(new Date().toLocaleTimeString());
    };

    const places = useMemo(() => placesResponse?.items || [], [placesResponse]);

    useEffect(() => {
        if (places.length > 0 && placeSelectedID === "") {
            setPlaceSelectedID(places[0].id);
        }
    }, [places, placeSelectedID]);

    useEffect(() => {
        setUnusedTables(unusedTablesResponse?.items || []);
    }, [unusedTablesResponse?.items]);

    useEffect(() => {
        const place = places.find(p => p.id === placeSelectedID);
        if (!place) return;

        setDroppedTables(place.tables || []);
        reloadGrid(place.tables);
    }, [placeSelectedID, places]);

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

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;

        if (over) {
            // From unused to yourself
            if (over.id === "unused-tables" && active.id.endsWith("-unused")) return

            // From x-y to unused
            if (over.id === "unused-tables") {
                const placeTable = active.data.current as PlaceTable
                const table = placeTable.table as Table

                const newDroppedTables = [...droppedTables || []].filter((item) => item.table_id !== active.id)
                const newUnusedTables = [...unusedTables, { ...table }]

                if (!data) return

                try {
                    await RemoveTableFromPlace(table.id, data)
                } catch (error: RequestError | any) {
                    notifyError(error.message || 'Ocorreu um erro ao remover o pedido');
                    return
                }

                setDroppedTables(newDroppedTables);
                setUnusedTables(newUnusedTables);

                queryClient.invalidateQueries({ queryKey: ['places'] });
                queryClient.invalidateQueries({ queryKey: ['unusedTables'] });
                return
            }

            // From unused to x-y
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
                queryClient.invalidateQueries({ queryKey: ['unusedTables'] });
                return
            }

            // From x-y to x-y
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
                queryClient.invalidateQueries({ queryKey: ['unusedTables'] });
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
        const lastRowUsed = [...droppedTables || []].find((item) => item.row === totalRows - 1);

        if (lastRowUsed) {
            notifyError("Nao é possivel remover uma linha que existe em uma mesa");
            return;
        }

        if (totalRows > 1) {
            setGrid(generateGrid(totalRows - 1, totalCols));
            setTotalRows((prev) => prev - 1);
        }
    };

    const addColumn = () => {
        setGrid(generateGrid(totalRows, totalCols + 1));
        setTotalCols((prev) => prev + 1);
    };

    const removeColumn = () => {
        const lastColumnUsed = [...droppedTables || []].find((item) => item.column === totalCols - 1);

        if (lastColumnUsed) {
            notifyError("Nao é possivel remover uma coluna que existe em uma mesa");
            return;
        }

        if (totalCols > 1) {
            setGrid(generateGrid(totalRows, totalCols - 1));
            setTotalCols((prev) => prev - 1);
        }
    };

    return (
        <>
            <PageTitle title="Configuração de Ambientes e Mesas" tooltip="Arraste as mesas para configurar o layout do salão." />
            <DndContext onDragEnd={handleDragEnd}>
                <div className="flex justify-around mb-4">
                    <div className="mr-4">
                        <div className="flex items-center justify-between">
                            <SelectField friendlyName="" name="place" selectedValue={placeSelectedID} setSelectedValue={setPlaceSelectedID} values={places} optional />
                            <div className="flex items-center gap-2">
                                <ButtonIconTextFloat title="Novo Ambiente" modalName="new-place" position="bottom-right">
                                    <PlaceForm />
                                </ButtonIconTextFloat>
                                {placeSelectedID && (
                                    <ButtonIconText
                                        icon={FaEdit}
                                        modalName={`edit-place-${placeSelectedID}`}
                                        title="Editar Ambiente"
                                        color="yellow"
                                    >
                                        <PlaceForm item={places.find(p => p.id === placeSelectedID)!} isUpdate />
                                    </ButtonIconText>
                                )}
                                <Refresh onRefresh={handleRefresh} isPending={isPendingPlaces} lastUpdate={lastUpdate} />
                            </div>
                        </div>
                        <div className="min-h-[80vh]"
                            style={{
                                display: "grid",
                                gridTemplateColumns: `repeat(${totalCols}, 100px) auto`,
                                gridTemplateRows: `repeat(${totalRows}, 80px) auto`,
                                gap: "4px",
                                position: "relative",
                                backgroundColor: "#f4f4f4",
                                padding: "20px",
                            }}
                        >
                            {/* Células da grade */}
                            {grid.map((cell) => (
                                <DroppableCell key={`${cell.x}-${cell.y}`} id={`${cell.x}-${cell.y}`}>
                                    {droppedTables?.filter((item) => item.column === cell.x && item.row === cell.y)
                                        .map((item) => (
                                            <DraggablePlaceToTable key={`${item.table_id}-${item.row}-${item.column}`} id={item.table_id} table={item} />
                                        ))}
                                </DroppableCell>
                            ))}

                            {/* Botões de controle */}
                            <div
                                style={{
                                    gridColumn: `${totalCols + 1}`,
                                    gridRow: `1 / span ${totalRows}`,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    justifyContent: "flex-start",
                                    gap: "4px",
                                }}
                            >
                                <button
                                    onClick={removeColumn}
                                    disabled={totalCols <= 1}
                                    style={{
                                        backgroundColor: "#FFC107",
                                        border: "none",
                                        color: "black",
                                        padding: "10px 20px",
                                        cursor: totalCols > 1 ? "pointer" : "not-allowed",
                                        width: "60px",
                                    }}
                                >
                                    -
                                </button>
                                <button
                                    onClick={addColumn}
                                    style={{
                                        backgroundColor: "#4CAF50",
                                        border: "none",
                                        color: "white",
                                        padding: "10px 20px",
                                        cursor: "pointer",
                                        width: "60px",
                                    }}
                                >
                                    +
                                </button>
                            </div>

                            <div
                                style={{
                                    gridColumn: `1 / span ${totalCols}`,
                                    gridRow: `${totalRows + 1}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    gap: "4px",
                                }}
                            >
                                <button
                                    onClick={removeRow}
                                    disabled={totalRows <= 1}
                                    style={{
                                        backgroundColor: "#FFC107",
                                        border: "none",
                                        color: "black",
                                        padding: "10px 20px",
                                        cursor: totalRows > 1 ? "pointer" : "not-allowed",
                                        width: "60px",
                                    }}
                                >
                                    -
                                </button>
                                <button
                                    onClick={addRow}
                                    style={{
                                        backgroundColor: "#4CAF50",
                                        border: "none",
                                        color: "white",
                                        padding: "10px 20px",
                                        cursor: "pointer",
                                        width: "60px",
                                    }}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold mb-2">Mesas não alocadas</h3>
                            <div className="flex items-center gap-2">
                                <ButtonIconTextFloat title="Nova Mesa" modalName="new-table" position="bottom-right-1">
                                    <TableForm />
                                </ButtonIconTextFloat>
                            </div>
                        </div>
                        <DroppableColumn key="unused-tables" id="unused-tables">
                            {unusedTables.map((item) => (
                                <DraggableUnusedTable key={`${item.id}-unused`} id={`${item.id}-unused`} table={item} />
                            ))}
                        </DroppableColumn>
                    </div>
                </div>
            </DndContext>
        </>
    );
};

const DraggablePlaceToTable = ({ id, table }: { id: string; table: PlaceTable }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id, data: table });

    const style = {
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        transition: "transform 0.2s ease",
        width: "80px",
        height: "60px",
        zIndex: 1000,
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{
                ...style,
                backgroundColor: "lightblue",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "grab",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <p className="text-sm">{table?.table.name || "Sem Nome"}</p>
        </div>
    );
};

const DraggableUnusedTable = ({ id, table }: { id: string; table: Table }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id, data: table });
    const modalHandler = useModal();

    const style = {
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        transition: "transform 0.2s ease",
        width: "130px",
        height: "60px",
        zIndex: 2000,
        backgroundColor: "lightblue",
        border: "1px solid #ccc",
        borderRadius: "4px",
        cursor: "grab",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        modalHandler.showModal(
            `edit-table-${table.id}`,
            `Editar Mesa ${table.name}`,
            <TableForm item={table} isUpdate />, 
            'md', 
            () => modalHandler.hideModal(`edit-table-${table.id}`)
        );
    };

    return (
        <div
            className="mb-2 min-h-[60px] relative"
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{ ...style }}
        >
            <span>{table?.name || "Sem Nome"}</span>
            <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleEdit}
                className="absolute top-1 right-1 p-1 bg-white bg-opacity-75 rounded hover:bg-opacity-100"
                style={{ zIndex: 3000 }}
            >
                <FaEdit size={12} />
            </button>
        </div>
    );
};

// Componente Droppable (células da mesa)
const DroppableCell = ({ id, children }: { id: string; children?: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    const style: CSSProperties = {
        backgroundColor: isOver ? "#d1fadf" : "#f9f9f9",
        border: "1px dashed #ccc",
        width: "100px",
        height: "80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative", // Corrigido: agora TypeScript reconhece como válido
    };

    return (
        <div ref={setNodeRef} style={style}>
            {children}
        </div>
    );
};
const DroppableColumn = ({ id, children }: { id: string; children?: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    const style: CSSProperties = {
        backgroundColor: isOver ? "#d1fadf" : "#f9f9f9",
        border: "1px dashed #ccc",
        width: "40vh",
        display: "flex",
        flexDirection: "column", // Garantir o alinhamento vertical
        alignItems: "center",
    };

    return (
        <div ref={setNodeRef} style={style} className="flex flex-col items-center p-2 min-h-[80vh]">
            {children}
        </div>
    );
};


export default DragAndDropGrid;
