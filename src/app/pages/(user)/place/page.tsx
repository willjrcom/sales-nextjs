"use client";

import React, { useState } from "react";
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
    const [rows, setRows] = useState(INITIAL_GRID_SIZE);
    const [cols, setCols] = useState(INITIAL_GRID_SIZE);
    const [grid, setGrid] = useState(generateGrid(rows, cols));
    const [droppedItems, setDroppedItems] = useState<{ id: string; x: number; y: number }[]>([]);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (over) {
            const [x, y] = over.id.split("-").map(Number); // Pega as coordenadas da célula
            setDroppedItems((prev) => [
                ...prev.filter((item) => item.id !== active.id), // Remove o item se já foi solto antes
                { id: active.id, x, y }, // Adiciona o item com as novas coordenadas
            ]);
        }
    };

    const addRow = () => {
        const newRow = rows;
        const updatedGrid = [...grid];
        for (let col = 0; col < cols; col++) {
            updatedGrid.push({ x: col, y: newRow });
        }
        setGrid(updatedGrid);
        setRows((prev) => prev + 1);
    };

    const removeRow = () => {
        if (rows > 1) {
            const updatedGrid = grid.filter((cell) => cell.y < rows - 1);
            setGrid(updatedGrid);
            setRows((prev) => prev - 1);
            setDroppedItems((prev) => prev.filter((item) => item.y < rows - 1)); // Remove itens fora da grade
        }
    };

    const addColumn = () => {
        const newCol = cols;
        const updatedGrid = [...grid];
        for (let row = 0; row < rows; row++) {
            updatedGrid.push({ x: newCol, y: row });
        }
        setGrid(updatedGrid);
        setCols((prev) => prev + 1);
    };

    const removeColumn = () => {
        if (cols > 1) {
            const updatedGrid = grid.filter((cell) => cell.x < cols - 1);
            setGrid(updatedGrid);
            setCols((prev) => prev - 1);
            setDroppedItems((prev) => prev.filter((item) => item.x < cols - 1)); // Remove itens fora da grade
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div style={{ marginBottom: "20px" }}>
                <button onClick={addRow}>+ Linha</button>
                <button onClick={removeRow} disabled={rows <= 1}>
                    - Linha
                </button>
                <button onClick={addColumn}>+ Coluna</button>
                <button onClick={removeColumn} disabled={cols <= 1}>
                    - Coluna
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "4px" }}>
                {grid.map((cell) => (
                    <DroppableCell key={`${cell.x}-${cell.y}`} id={`${cell.x}-${cell.y}`} />
                ))}
            </div>

            <div style={{ marginTop: "20px" }}>
                <DraggableItem id="item-1" label="Item 1" />
                <DraggableItem id="item-2" label="Item 2" />
            </div>

            <div style={{ marginTop: "20px" }}>
                <h3>Itens Soltos:</h3>
                <ul>
                    {droppedItems.map((item) => (
                        <li key={item.id}>
                            {item.id} - X: {item.x}, Y: {item.y}
                        </li>
                    ))}
                </ul>
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
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{
                ...style,
                padding: "10px",
                backgroundColor: "lightblue",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "grab",
                display: "inline-block",
                marginRight: "10px",
            }}
        >
            {label}
        </div>
    );
};

// Componente Droppable (células da mesa)
const DroppableCell = ({ id }: { id: string }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    const style = {
        backgroundColor: isOver ? "#d1fadf" : "#f9f9f9",
        border: "1px dashed #ccc",
        width: "80px",
        height: "80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    return <div ref={setNodeRef} style={style} />;
};

export default DragAndDropGrid;
