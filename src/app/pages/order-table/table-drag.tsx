'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';

const ItemTypes = {
  MESA: 'mesa',
};

interface DragItem {
  id: number;
  type: string;
}

interface MesaProps {
  id: number;
  color: string;
  moveMesa: (fromId: number, toId: number) => void;
  toggleSelect: (id: number) => void;
  isSelected: boolean;
}

const Mesa: React.FC<MesaProps> = ({ id, color, moveMesa, toggleSelect, isSelected }) => {
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

  useEffect(() => {
    if (ref.current) {
      drag(drop(ref));
    }
  }, [drag, drop]);

  return (
    <div className="flex flex-col items-center">
      <div
        ref={ref}
        onClick={() => toggleSelect(id)}
        className={`w-16 h-16 ${color} ${isDragging ? 'opacity-50' : 'opacity-100'} ${isSelected ? 'border-4 border-blue-500' : 'border'}`}
        style={{ margin: '5px' }}
      />
      <span>{id}</span>
    </div>
  );
};

const Mesas: React.FC = () => {
  const [mesas, setMesas] = useState<{ id: number; color: string }[]>([
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

  const [selectedMesas, setSelectedMesas] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelectedMesas((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((mesaId) => mesaId !== id) : [...prevSelected, id]
    );
  };

  const moveMesa = (fromId: number, toId: number) => {
    const fromIndex = mesas.findIndex((mesa) => mesa.id === fromId);
    const toIndex = mesas.findIndex((mesa) => mesa.id === toId);
    const updatedMesas = [...mesas];
    const [movedMesa] = updatedMesas.splice(fromIndex, 1);
    updatedMesas.splice(toIndex, 0, movedMesa);
    setMesas(updatedMesas);
  };

  const removeMesas = (ids: number[]) => {
    setMesas(mesas.filter((mesa) => !ids.includes(mesa.id)));
    setSelectedMesas([]);
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.MESA,
    drop: () => removeMesas(selectedMesas),
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const dropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (dropRef.current) {
      drop(dropRef.current);
    }
  }, [drop]);

  return (
    <div className="flex">
      <div className={`w-1/4 flex flex-col ${isOver ? 'bg-gray-200' : ''}`} ref={dropRef}>
        <div className="p-4">Remove Here</div>
      </div>
      <div className="w-3/4 grid grid-cols-8 gap-2">
        {mesas.map((mesa) => (
          <Mesa
            key={mesa.id}
            id={mesa.id}
            color={mesa.color}
            moveMesa={moveMesa}
            toggleSelect={toggleSelect}
            isSelected={selectedMesas.includes(mesa.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Mesas;
