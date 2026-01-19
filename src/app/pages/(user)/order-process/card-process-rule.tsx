import ProcessRule from "@/app/entities/process-rule/process-rule"
import Link from "next/link"

interface CardProcessRuleProps {
    processRule: ProcessRule
}

const CardProcessRule = ({ processRule }: CardProcessRuleProps) => {
    return (
        <Link href={`/pages/order-process/process-rule/${processRule.category_id}/${processRule.id}`}
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

export default CardProcessRule