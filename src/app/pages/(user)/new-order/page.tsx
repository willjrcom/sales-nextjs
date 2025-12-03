'use client';

import Link from "next/link";
import React, { useState } from "react";
import PageTitle from '@/app/components/PageTitle';
import { FaLuggageCart, FaMotorcycle, FaUtensils } from "react-icons/fa";


const PageNewOrder = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = [
    { id: "mesa", label: "Mesa", icon: <FaUtensils className="w-24 h-24 mb-4" />, route: "/pages/new-order/table" },
    { id: "entrega", label: "Entrega", icon: <FaMotorcycle className="w-24 h-24 mb-4" />, route: "/pages/new-order/delivery" },
    { id: "balcao", label: "Balcão/Retirada", icon: <FaLuggageCart className="w-24 h-24 mb-4" />, route: "/pages/new-order/pickup" },
  ];

  return (
    <div className="flex flex-col h-full w-full items-center justify-center px-4 py-6 sm:py-10">
      <PageTitle title="Novo Pedido" tooltip="Selecione o tipo de pedido: Mesa, Entrega ou Balcão/Retirada." />

      <div className="flex w-full max-w-5xl flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center sm:gap-6">
        {options.map((option) => (
          <Link
            href={option.route}
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            className={
              `w-full sm:w-1/3 rounded-xl bg-white shadow-lg flex flex-col items-center justify-center p-6 sm:p-8 transform transition-all duration-200 mx-auto
              ${selectedOption === option.id
                ? 'border-4 border-purple-500 bg-purple-50'
                : 'hover:scale-105 hover:shadow-2xl hover:border-4 hover:border-purple-300 hover:bg-purple-100'
              }`
            }
          >
            <div className="text-center">
              {React.cloneElement(option.icon, { className: 'w-16 h-16 sm:w-24 sm:h-24 mb-4 text-gray-700' })}
              <div className="font-bold text-base sm:text-xl">{option.label}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PageNewOrder;
