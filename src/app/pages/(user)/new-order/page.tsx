'use client';

import Link from "next/link";
import React from "react";
import { Utensils, Bike, ShoppingBag, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const PageNewOrder = () => {
  const options = [
    {
      id: "mesa",
      label: "Mesa / Salão",
      description: "Atendimento presencial com controle de mesas e comandas.",
      icon: <Utensils className="w-12 h-12 text-blue-600" />,
      route: "/pages/new-order/table",
      color: "blue"
    },
    {
      id: "entrega",
      label: "Entrega / Delivery",
      description: "Pedidos para entrega externa com busca de clientes e taxas.",
      icon: <Bike className="w-12 h-12 text-green-600" />,
      route: "/pages/new-order/delivery",
      color: "green"
    },
    {
      id: "balcao",
      label: "Balcão / Retirada",
      description: "Venda rápida direta no caixa para consumo ou retirada.",
      icon: <ShoppingBag className="w-12 h-12 text-orange-600" />,
      route: "/pages/new-order/pickup",
      color: "orange"
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'hover:border-blue-500 hover:bg-blue-50/50 shadow-blue-100';
      case 'green': return 'hover:border-green-500 hover:bg-green-50/50 shadow-green-100';
      case 'orange': return 'hover:border-orange-500 hover:bg-orange-50/50 shadow-orange-100';
      default: return 'hover:border-purple-500 hover:bg-purple-50/50 shadow-purple-100';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] p-4 bg-gray-50/50">
      <div className="w-full max-w-5xl space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            Novo Pedido
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Selecione o tipo de atendimento para iniciar as vendas. Cada modalidade possui ferramentas específicas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {options.map((option) => (
            <Link href={option.route} key={option.id} className="group">
              <Card className={`h-full border-2 border-transparent transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-2xl ${getColorClasses(option.color)}`}>
                <CardHeader className="pb-2">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300
                    ${option.color === 'blue' ? 'bg-blue-100' : option.color === 'green' ? 'bg-green-100' : 'bg-orange-100'}`}>
                    {option.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold">{option.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-base leading-relaxed">
                    {option.description}
                  </CardDescription>
                  <div className={`flex items-center gap-2 font-bold transition-colors
                    ${option.color === 'blue' ? 'text-blue-600' : option.color === 'green' ? 'text-green-600' : 'text-orange-600'}`}>
                    Iniciar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageNewOrder;
