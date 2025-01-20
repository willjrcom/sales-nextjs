"use client";

import React, { CSSProperties, useEffect, useState } from "react";
import { DndContext, useDroppable, useDraggable } from "@dnd-kit/core";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchPlaces, updatePlace } from "@/redux/slices/places";
import { useSession } from "next-auth/react";
import PlaceTable from "@/app/entities/place/place_table";
import { SelectField } from "@/app/components/modal/field";
import Place from "@/app/entities/place/place";
import RequestError from "@/app/utils/error";
import Table from "@/app/entities/table/table";
import { addUnusedTable, fetchUnusedTables, removeUnusedTable, updateUnusedTable } from "@/redux/slices/unused-tables";
import AddTableToPlace from "@/app/api/place/table/add/place";
import RemoveTableFromPlace from "@/app/api/place/table/remove/place";
import Refresh from "@/app/components/crud/refresh";

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
    const placesSlice = useSelector((state: RootState) => state.places);
    const unusedTablesSlice = useSelector((state: RootState) => state.unusedTables);
    const [places, setPlaces] = useState<Place[]>(Object.values(placesSlice.entities));
    const [unusedTables, setUnusedTables] = useState<Table[]>([]);
    const [droppedTables, setDroppedTables] = useState<PlaceTable[]>([]);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();
    const [placeSelectedID, setPlaceSelectedID] = useState<string>("");
    const [error, setError] = useState<RequestError | null>(null);

    useEffect(() => {
        if (data && Object.values(placesSlice.entities).length == 0) {
            dispatch(fetchPlaces(data));
        }
        if (data) {
            dispatch(fetchUnusedTables(data))
        }
    }, [data?.user.id_token, dispatch])

    useEffect(() => {
        setPlaces(Object.values(placesSlice.entities));

        const firstPlace = Object.values(placesSlice.entities)[0];
        if (!firstPlace) return
        if (placeSelectedID === "") setPlaceSelectedID(firstPlace.id)
    }, [placesSlice.entities])

    useEffect(() => {
        setUnusedTables(Object.values(unusedTablesSlice.entities));
    }, [unusedTablesSlice.entities])

    useEffect(() => {
        const place = placesSlice.entities[placeSelectedID]
        if (!place) return;

        setDroppedTables(place.tables || []);
        reloadGrid(place.tables);
    }, [placeSelectedID])

    useEffect(() => {
        if (error && error.message != "") {
            setTimeout(() => {
                setError(null);
            }, 10000);
        }
    }, [error])

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
                } catch (error) {
                    setError(error as RequestError)
                    return
                }

                setDroppedTables(newDroppedTables);
                setUnusedTables(newUnusedTables);

                dispatch(updatePlace({ type: "UPDATE", payload: { id: placeSelectedID, changes: { tables: newDroppedTables } } }));
                dispatch(addUnusedTable(table));
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
                } catch (error) {
                    setError(error as RequestError)
                    return
                }

                setUnusedTables(newUnusedTables);
                setDroppedTables(newDroppedTables);

                dispatch(updatePlace({ type: "UPDATE", payload: { id: placeSelectedID, changes: { tables: newDroppedTables } } }));
                dispatch(removeUnusedTable(table.id));
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
                } catch (error) {
                    setError(error as RequestError)
                    return
                }

                dispatch(updatePlace({ type: "UPDATE", payload: { id: placeSelectedID, changes: { tables: tables } } }));
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
            setError(new RequestError("Nao é possivel remover uma linha que existe em uma mesa"));
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
            setError(new RequestError("Nao é possivel remover uma coluna que existe em uma mesa"));
            return;
        }

        if (totalCols > 1) {
            setGrid(generateGrid(totalRows, totalCols - 1));
            setTotalCols((prev) => prev - 1);
        }
    };

    return (
        <>
            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <DndContext onDragEnd={handleDragEnd}>
                <div className="flex justify-around mb-4">
                    <div className="mr-4">
                        <div className="flex items-center justify-between">
                            <SelectField friendlyName="" name="place" selectedValue={placeSelectedID} setSelectedValue={setPlaceSelectedID} values={places} optional/>
                            <Refresh slice={placesSlice} fetchItems={fetchPlaces} />
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
                            <Refresh slice={unusedTablesSlice} fetchItems={fetchUnusedTables} removeText={true} />
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

    return (
        <div
            className="mb-2 min-h-[60px]"
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{ ...style }}
        >
            {table?.name || "Sem Nome"}
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
