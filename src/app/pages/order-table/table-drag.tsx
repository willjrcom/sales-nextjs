'use client'// components/Mesas.js
import React, { useRef } from 'react';
import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemTypes = {
  MESA: 'mesa',
};

interface DragItem {
  id: number;
  type: string;
}

const Mesa = ({ id, color, moveMesa }: { id: number, color: string, moveMesa: (fromId: number, toId: number) => void }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>(() => ({
    type: ItemTypes.MESA,
    item: { id, type: ItemTypes.MESA },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop<DragItem>(() => ({
    accept: ItemTypes.MESA,
    drop: (item) => moveMesa(item.id, id),
  }));

  drag(drop(ref));

  return (
    <div className="flex flex-col items-center">
      <div
        ref={ref}
        className={`w-16 h-16 ${color} ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        style={{ border: '1px solid black', margin: '5px' }}
      />
      <span>{id}</span>
    </div>
  );
};

const Mesas = () => {
  const [mesas, setMesas] = useState([
    { id: 1, color: 'bg-green-500' },
    { id: 2, color: 'bg-green-500' },
    { id: 3, color: 'bg-yellow-500' },
    { id: 4, color: 'bg-green-500' },
    { id: 5, color: 'bg-green-500' },
    { id: 6, color: 'bg-yellow-500' },
    { id: 7, color: 'bg-green-500' },
    { id: 8, color: 'bg-green-500' },
    { id: 9, color: 'bg-green-500' },
    { id: 10, color: 'bg-green-500' },
    { id: 11, color: 'bg-green-500' },
    { id: 12, color: 'bg-green-500' },
    { id: 13, color: 'bg-green-500' },
    { id: 14, color: 'bg-green-500' },
    { id: 15, color: 'bg-green-500' },
  ]);

  const moveMesa = (fromId: number, toId: number) => {
    const fromIndex = mesas.findIndex((mesa) => mesa.id === fromId);
    const toIndex = mesas.findIndex((mesa) => mesa.id === toId);
    const updatedMesas = [...mesas];
    const [movedMesa] = updatedMesas.splice(fromIndex, 1);
    updatedMesas.splice(toIndex, 0, movedMesa);
    setMesas(updatedMesas);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex">
        <div className="w-1/4 flex flex-col">
          {mesas.slice(0, 3).map((mesa) => (
            <Mesa key={mesa.id} id={mesa.id} color={mesa.color} moveMesa={moveMesa} />
          ))}
        </div>
        <div className="w-3/4 grid grid-cols-8 gap-2">
          {mesas.slice(3).map((mesa) => (
            <Mesa key={mesa.id} id={mesa.id} color={mesa.color} moveMesa={moveMesa} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default Mesas;
