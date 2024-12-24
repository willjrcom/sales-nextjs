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
import RequestError from "@/app/api/error";
import Table from "@/app/entities/table/table";
import { addUnusedTable, fetchUnusedTables, removeUnusedTable, updateUnusedTable } from "@/redux/slices/unused-tables";
import AddTableToPlace from "@/app/api/place/table/add/route";
import RemoveTableFromPlace from "@/app/api/place/table/remove/route";
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
    const [places, setPlaces] = useState<Place[]>(Object.values(placesSlice.entities));
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
    }, [data?.user.idToken, dispatch])

    useEffect(() => {
        setPlaces(Object.values(placesSlice.entities));

        const firstPlace = Object.values(placesSlice.entities)[0];
        if (!firstPlace) return
        if (placeSelectedID === "") setPlaceSelectedID(firstPlace.id)
    }, [placesSlice.entities])

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

    return (
        <>
            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <div className="flex justify-center">
                <div>
                    <div className="flex items-center justify-between">
                        <SelectField friendlyName="" name="place" selectedValue={placeSelectedID} setSelectedValue={setPlaceSelectedID} values={places} />
                        <Refresh slice={placesSlice} fetchItems={fetchPlaces} />
                    </div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${totalCols - 1}, 100px) auto`,
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
                    </div>
                </div>
            </div>
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
