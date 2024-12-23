"use client";

import React, { CSSProperties, useEffect, useState } from "react";
import { DndContext, useDroppable, useDraggable } from "@dnd-kit/core";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchPlaces } from "@/redux/slices/places";
import { useSession } from "next-auth/react";
import PlaceTable from "@/app/entities/place/place_table";
import { SelectField } from "@/app/components/modal/field";
import Place from "@/app/entities/place/place";
import Table from "@/app/entities/table/table";

const INITIAL_GRID_SIZE = 5; // Tamanho inicial da grade

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
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();
    const [droppedTables, setDroppedTables] = useState<PlaceTable[]>([]);
    const [placeSelectedID, setPlaceSelectedID] = useState<string>("");

    useEffect(() => {
        if (data && Object.values(placesSlice.entities).length == 0) {
            dispatch(fetchPlaces(data));
        }
    }, [data?.user.idToken, dispatch])

    useEffect(() => {
        if (Object.values(placesSlice.entities).length > 0) {
            setPlaces(Object.values(placesSlice.entities));
            
            const firstPlace = Object.values(placesSlice.entities)[0];
            if (!firstPlace) return
            setPlaceSelectedID(firstPlace.id)
        }
    }, [placesSlice.entities])

    useEffect(() => {
        const place = placesSlice.entities[placeSelectedID]
        if (!place) return;

        setDroppedTables(place.tables);
    }, [placeSelectedID])

    useEffect(() => {
        console.log(droppedTables)
    }, [droppedTables])
    const handleDragEnd = (event: any) => {
        const { active, over } = event;
    
        if (over) {
            const [x, y] = over.id.split("-").map(Number);
    
            setDroppedTables((prev) => [
                ...prev.filter((item) => item.table_id !== active.id), // Remove o item se já foi solto antes
                { ...active.data.current, row: y, column: x }, // Adiciona o item com as novas coordenadas
            ]);
        }
    };
    

    const addRow = () => {
        setGrid(generateGrid(totalRows + 1, totalCols));
        setTotalRows((prev) => prev + 1);
    };

    const removeRow = () => {
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
        if (totalCols > 1) {
            setGrid(generateGrid(totalRows, totalCols - 1));
            setTotalCols((prev) => prev - 1);
        }
    };

    return (
        <>
        <SelectField friendlyName="Local" name="place" selectedValue={placeSelectedID} setSelectedValue={setPlaceSelectedID} values={places} />
            <DndContext onDragEnd={handleDragEnd}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${totalCols}, 80px) auto`,
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
                            {droppedTables
                                .filter((item) => item.column === cell.x && item.row === cell.y)
                                .map((item) => (
                                    <DraggableItem key={`${item.table_id}-${item.row}-${item.column}`} id={item.table_id} table={item} />
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
            </DndContext>
        </>
    );
};

const DraggableItem = ({ id, table }: { id: string; table: PlaceTable }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id, data: table });

    const style = {
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        transition: "transform 0.2s ease",
        width: "60px",
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
            {table?.table.name || "Sem Nome"} {/* Renderiza um fallback se `table.name` for undefined */}
        </div>
    );
};


// Componente Droppable (células da mesa)
const DroppableCell = ({ id, children }: { id: string; children?: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    const style: CSSProperties = {
        backgroundColor: isOver ? "#d1fadf" : "#f9f9f9",
        border: "1px dashed #ccc",
        width: "80px",
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


export default DragAndDropGrid;
