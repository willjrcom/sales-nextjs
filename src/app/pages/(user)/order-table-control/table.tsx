import React from 'react';
import { useState } from 'react';
import PageTitle from '@/app/components/PageTitle';

const Table = ({ status, onClick }: { status: string, onClick: () => void }) => {
  const getStatusColor = () => {
    switch(status) {
      case 'livre':
        return 'bg-green-500';
      case 'reservada':
        return 'bg-yellow-500';
      case 'em uso':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div 
      className={`w-16 h-16 m-2 flex items-center justify-center cursor-pointer ${getStatusColor()}`} 
      onClick={onClick}
    >
      {/* Conteúdo adicional da mesa */}
    </div>
  );
};


const Tables = () => {
  const [tables, setTables] = useState(Array(20).fill('livre'));

  const handleTableClick = (index: number) => {
    const newTables = [...tables];
    newTables[index] = newTables[index] === 'livre' ? 'reservada' : 'livre';
    setTables(newTables);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <PageTitle title="Mesas" tooltip="Visualize e gerencie o status das mesas disponíveis, reserve ou libere conforme necessário." />
      <div className="flex flex-wrap">
        {tables.map((status, index) => (
          <Table 
            key={status} 
            status={status} 
            onClick={() => handleTableClick(index)}
          />
        ))}
      </div>
    </div>
  );
};


export default Tables