"use client";

import GetCategoriesWithOrderProcess from '@/app/api/category/all/with-order-process/category';
import Carousel from '@/app/components/carousel/carousel';
import Category from '@/app/entities/category/category';
import ProcessRule from '@/app/entities/process-rule/process-rule';
import { fetchCategories } from '@/redux/slices/categories';
import { AppDispatch } from '@/redux/store';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const OrderProcess = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const { data } = useSession();
    const dispatch = useDispatch<AppDispatch>();

    const fetch = async () => {
        if (!data) return;
        const categoriesFound = await GetCategoriesWithOrderProcess(data);
        console.log(categoriesFound)
        setCategories(categoriesFound);
    }

    useEffect(() => {
        if (categories.length === 0) {
            fetch()
        }

        const interval = setInterval(() => {
            fetch()
        }, 60000); // Atualiza a cada 60 segundos

        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data?.user.id_token, dispatch]);

    return (
        <div className='max-w-[85vw] flex-auto h-full'>
            <h1 className="text-2xl font-bold mb-4">Processos</h1>
            <p className="text-sm text-gray-600 mb-4">
                Categorias sem regra de processo: {categories.filter(c => !c.use_process_rule).map(c => c.name).join(', ') || 'Nenhuma'}
            </p>
            {categories?.map((category) => <CardCategory key={category.id} category={category} />)}
        </div>
    );
};

interface CardCategoryProps {
    category: Category;
}

const CardCategory = ({ category }: CardCategoryProps) => {
    if (!category.process_rules) return null;
    // <div key={category.id} className="p-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

    const processRules = [...(category.process_rules || [])].sort((a, b) => a.order - b.order)
    return (
        <>
            <hr className="my-4" />
            <h1 className="text-2xl font-bold mb-4">{category.name}</h1>
            <Carousel items={processRules}>
                {(processRule) => <CardProcessRule key={processRule.id} processRule={processRule} />}
            </Carousel>
        </>
    )
}
interface CardProcessRuleProps {
    processRule: ProcessRule
}

const CardProcessRule = ({ processRule }: CardProcessRuleProps) => {
    return (
        <Link href={`/pages/order-process/process-rule/${processRule.id}`}
            key={processRule.id}
            className="bg-gray-100 p-4 rounded-lg shadow-md flex flex-col justify-between h-32"
        >
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{processRule.name}</h2>
                <p className="text-sm text-gray-600 rounded-full bg-gray-300 px-4 py-1">
                    {processRule.order}
                </p>
            </div>
            <div className="flex items-center justify-between mt-4">
                {processRule.total_order_process_late > 0 ? (
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                        <span className="text-red-600 font-semibold text-sm">
                            {processRule.total_order_process_late} Atrasados
                        </span>
                    </div>
                ) : (
                    <div>&nbsp;</div>
                )}

                {processRule.total_order_queue > 0 ? (
                <div className="bg-yellow-400 text-white font-medium text-sm px-4 py-1 rounded-full">
                    {processRule.total_order_queue} em fila
                </div>
                ) : (
                <div>&nbsp;</div>
                )}
            </div>
        </Link>
    )
}
export default OrderProcess;
