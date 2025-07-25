"use client";

import GetCategoriesWithOrderProcess from '@/app/api/category/all/with-order-process/category';
import Carousel from '@/app/components/carousel/carousel';
import Category from '@/app/entities/category/category';
import ProcessRule from '@/app/entities/process-rule/process-rule';
import { AppDispatch } from '@/redux/store';
import { useSession } from 'next-auth/react';
import { HiOutlineRefresh } from 'react-icons/hi';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import PageTitle from '@/app/components/PageTitle';
import { useDispatch } from 'react-redux';

const OrderProcess = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const { data } = useSession();
    const dispatch = useDispatch<AppDispatch>();

    const fetch = async () => {
        if (!data) return;
        const categoriesFound = await GetCategoriesWithOrderProcess(data);
        setCategories(categoriesFound);
    }

    // Initial fetch (guard against double invocation in React.StrictMode)
    const initialFetched = useRef(false);
    useEffect(() => {
        if (!data || initialFetched.current) return;
        initialFetched.current = true;
        fetch();
    }, [data]);

    // Polling every 60 seconds
    useEffect(() => {
        if (!data) return;
        const interval = setInterval(() => fetch(), 30000);
        return () => clearInterval(interval);
    }, [data]);

    const noRuleCategories = categories.filter(c => !c.use_process_rule && !c.is_additional && !c.is_complement);
    const validCategories = categories.filter(c => c.use_process_rule);

    return (
        <div className='max-w-[85vw] flex-auto h-full'>
            <div className="flex items-center justify-between mb-4">
                <PageTitle title="Processos" tooltip="Exibe as regras de processamento de pedidos, agrupadas por categoria, com indicadores de atraso e fila." />
                <button
                    onClick={fetch}
                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
                    aria-label="Atualizar"
                >
                    <HiOutlineRefresh className="h-5 w-5 text-gray-800" />
                </button>
            </div>
            <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Categorias principais sem regra de processo</h2>
                <div className="flex flex-wrap gap-2">
                    {noRuleCategories.length > 0 ? (
                        noRuleCategories.map(cat => (
                            <span key={cat.id} className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                                {cat.name}
                            </span>
                        ))
                    ) : (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                            Nenhuma
                        </span>
                    )}
                </div>
            </div>
            {validCategories?.map((category) => <CardCategory key={category.id} category={category} />)}
        </div>
    );
};

interface CardCategoryProps {
    category: Category;
}

const CardCategory = ({ category }: CardCategoryProps) => {
    if (!category.process_rules) {
        return <>
            <hr className="my-4" />
            <h1 className="text-2xl font-bold mb-4">{category.name}</h1>
            <p className="text-red-500">Nenhum processo cadastrado!</p>
        </>
    };
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
