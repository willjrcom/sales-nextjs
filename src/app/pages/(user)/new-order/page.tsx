'use client';

import Link from "next/link";
import React from "react";
import { Utensils, Bike, ShoppingBag, ArrowRight, Lock as LockIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { useSession } from "next-auth/react";
import GetCompany from "@/app/api/company/company";

const PageNewOrder = () => {
  const { data: session } = useSession();
  const { data: company, isLoading } = useQuery({
    queryKey: ['company'],
    queryFn: () => GetCompany(session!),
    enabled: !!session?.user?.access_token,
  });

  const isEnabled = (key: string) => {
    if (!company) return true;
    return company.preferences[key] === 'true';
  };

  const isStoreOpen = () => {
    if (!company || !company.schedules || company.schedules.length === 0) return true;

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const daySchedule = company.schedules.find((s: any) => s.day_of_week === dayOfWeek);
    if (!daySchedule) return true; // Default to open if no schedule for today

    if (!daySchedule.is_open) return false;
    if (!daySchedule.hours || daySchedule.hours.length === 0) return true;

    return daySchedule.hours.some((h: any) => {
      const [startHour, startMin] = h.opening_time.split(':').map(Number);
      const [endHour, endMin] = h.closing_time.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
      return currentTime >= startTime && currentTime <= endTime;
    });
  };

  const isOpen = isStoreOpen();

  const options = [
    {
      id: "mesa",
      label: "Mesa / Salão",
      description: "Atendimento presencial com controle de mesas e comandas.",
      icon: <Utensils className="w-12 h-12 text-blue-600" />,
      route: "/pages/new-order/table",
      color: "blue",
      disabled: !isEnabled('enable_table') || !isOpen,
      isClickable: isEnabled('enable_table'),
      reason: !isOpen ? "Fora do horário de funcionamento" : "Desativado nas preferências"
    },
    {
      id: "entrega",
      label: "Entrega / Delivery",
      description: "Pedidos para entrega externa com busca de clientes e taxas.",
      icon: <Bike className="w-12 h-12 text-green-600" />,
      route: "/pages/new-order/delivery",
      color: "green",
      disabled: !isEnabled('enable_delivery') || !isOpen,
      isClickable: isEnabled('enable_delivery'),
      reason: !isOpen ? "Fora do horário de funcionamento" : "Desativado nas preferências"
    },
    {
      id: "balcao",
      label: "Balcão / Retirada",
      description: "Venda rápida direta no caixa para consumo ou retirada.",
      icon: <ShoppingBag className="w-12 h-12 text-orange-600" />,
      route: "/pages/new-order/pickup",
      color: "orange",
      disabled: !isEnabled('enable_pickup') || !isOpen,
      isClickable: isEnabled('enable_pickup'),
      reason: !isOpen ? "Fora do horário de funcionamento" : "Desativado nas preferências"
    },
  ];

  const getColorClasses = (color: string, disabled?: boolean) => {
    if (disabled) return 'border-gray-200 bg-gray-50/50 cursor-not-allowed grayscale-[0.8]';
    switch (color) {
      case 'blue': return 'hover:border-blue-500 hover:bg-blue-50/50 shadow-blue-100';
      case 'green': return 'hover:border-green-500 hover:bg-green-50/50 shadow-green-100';
      case 'orange': return 'hover:border-orange-500 hover:bg-orange-50/50 shadow-orange-100';
      default: return 'hover:border-purple-500 hover:bg-purple-50/50 shadow-purple-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[90vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
          {options.map((option) => {
            const CardContentWrapper = (
              <Card className={`h-full border-2 transition-all duration-300 relative overflow-hidden flex flex-col ${getColorClasses(option.color, option.disabled)} ${!option.disabled ? 'group-hover:-translate-y-2 group-hover:shadow-2xl transform' : ''}`}>
                {option.disabled && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-gray-200/80 backdrop-blur-sm text-gray-500 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-gray-300">
                      <LockIcon className="w-3 h-3" /> DISPONÍVEL
                    </div>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 ${!option.disabled ? 'group-hover:scale-110' : ''}
                    ${option.color === 'blue' ? 'bg-blue-100' : option.color === 'green' ? 'bg-green-100' : 'bg-orange-100'}`}>
                    {option.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold">{option.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                  <CardDescription className="text-base leading-relaxed">
                    {option.description}
                  </CardDescription>
                  {!option.disabled ? (
                    <div className={`flex items-center gap-2 font-bold transition-colors
                                            ${option.color === 'blue' ? 'text-blue-600' : option.color === 'green' ? 'text-green-600' : 'text-orange-600'}`}>
                      Iniciar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm font-medium italic">
                      {option.reason}
                    </div>
                  )}
                </CardContent>
              </Card>
            );

            if (!option.isClickable) {
              return (
                <div key={option.id} className="opacity-75">
                  {CardContentWrapper}
                </div>
              );
            }

            return (
              <Link href={option.route} key={option.id} className={`group ${option.disabled ? "opacity-75" : ""}`}>
                {CardContentWrapper}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PageNewOrder;
