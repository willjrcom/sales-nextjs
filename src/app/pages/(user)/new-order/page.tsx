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
    <div className="min-w-[80vw]">
      <PageTitle title="Novo Pedido" tooltip="Selecione o tipo de pedido: Mesa, Entrega ou Balcão/Retirada." />

      <div className="flex gap-4 ">
        {options.map((option) => (
          <Link href={option.route}
            key={option.id}
            className={`w-1/3 h-[75vh] rounded overflow-hidden shadow-lg flex flex-col items-center justify-center shadow-md cursor-pointer transition duration-300 hover:bg-gray-200
              ${selectedOption === option.id
              ? "border-4 border-purple-500"
              : "hover:border-4 hover:border-gray-300"
              }`}
            onClick={() => setSelectedOption(option.id)}>
            <div className="px-6 py-4 text-center">
              <p className="text-gray-700 text-base">{option.icon}</p>
              <div className="font-bold text-xl mb-2">{option.label}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PageNewOrder;
