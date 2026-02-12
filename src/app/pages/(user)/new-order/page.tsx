'use client';

import Link from "next/link";
import React, { useState } from "react";
import PageTitle from '@/app/components/ui/page-title';
import { FaLuggageCart, FaMotorcycle, FaUtensils } from "react-icons/fa";
import ThreeColumnHeader from "@/components/header/three-column-header";


const PageNewOrder = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = [
    { id: "mesa", label: "Mesa", icon: <FaUtensils className="w-24 h-24 mb-4" />, route: "/pages/new-order/table" },
    { id: "entrega", label: "Entrega", icon: <FaMotorcycle className="w-24 h-24 mb-4" />, route: "/pages/new-order/delivery" },
    { id: "balcao", label: "Balcão/Retirada", icon: <FaLuggageCart className="w-24 h-24 mb-4" />, route: "/pages/new-order/pickup" },
  ];

  return (
    <div className="flex flex-col h-full w-full items-center py-4 sm:py-8 gap-4 sm:gap-8">
      <ThreeColumnHeader center={<PageTitle title="Novo Pedido" tooltip="Selecione o tipo de pedido: Mesa, Entrega ou Balcão/Retirada." />} />

      <div className="w-full max-w-5xl px-4 flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 h-full sm:h-auto pb-4 sm:pb-0">
        {options.map((option) => (
          <Link
            href={option.route}
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            className={
              `rounded-lg bg-white shadow-lg flex flex-col items-center justify-center p-4 transform transition-all duration-200 flex-1 w-full sm:aspect-square sm:flex-none sm:w-auto
              ${selectedOption === option.id
                ? 'border-4 border-purple-500 bg-purple-50'
                : 'hover:scale-105 hover:shadow-2xl hover:border-4 hover:border-purple-300 hover:bg-purple-100'
              }`
            }
          >
            <div className="text-center">
              {React.cloneElement(option.icon, { className: 'w-16 h-16 sm:w-24 sm:h-24 mb-4 text-gray-700 mx-auto' })}
              <div className="font-bold text-lg sm:text-xl text-gray-800">{option.label}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PageNewOrder;
