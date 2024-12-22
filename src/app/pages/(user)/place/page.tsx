"use client";

import React, { CSSProperties, useState } from "react";
import { DndContext, useDroppable, useDraggable } from "@dnd-kit/core";

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
    const [droppedItems, setDroppedItems] = useState<{ id: string; x: number; y: number }[]>([
        { id: "item-1", x: 0, y: 0 },
        { id: "item-2", x: 1, y: 1 },
    ]);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (over) {
            const [x, y] = over.id.split("-").map(Number); // Pega as coordenadas da célula
            console.log(x, y)
            setDroppedItems((prev) => [
                ...prev.filter((item) => item.id !== active.id), // Remove o item se já foi solto antes
                { id: active.id, x, y }, // Adiciona o item com as novas coordenadas
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
                        {droppedItems
                            .filter((item) => item.x === cell.x && item.y === cell.y)
                            .map((item) => (
                                <DraggableItem key={item.id} id={item.id} label={item.id} />
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
    );
};

// Componente Draggable (itens arrastáveis)
const DraggableItem = ({ id, label }: { id: string; label: string }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

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
            {label}
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
