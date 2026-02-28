import ProcessRule from "@/app/entities/process-rule/process-rule"
import Link from "next/link"
import { Clock, AlertCircle, ListChecks, ChevronRight } from "lucide-react"

interface CardProcessRuleProps {
    processRule: ProcessRule
}

const CardProcessRule = ({ processRule }: CardProcessRuleProps) => {
    return (
        <Link href={`/pages/order-process/process-rule/${processRule.category_id}/${processRule.id}`}
            key={processRule.id}
            className="group relative bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 flex flex-col justify-between h-32 overflow-hidden"
        >
            {/* Background Decor */}
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />

            <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                    <h2 className="text-base font-bold text-gray-800 group-hover:text-purple-700 transition-colors leading-tight truncate max-w-[140px]">
                        {processRule.name}
                    </h2>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                        Ordem #{processRule.order}
                    </p>
                </div>
                <div className="p-1.5 bg-gray-50 rounded-md group-hover:bg-purple-50 transition-colors">
                    <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-purple-500" />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                    {processRule.total_order_process_late > 0 ? (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 animate-pulse">
                            <AlertCircle className="w-3 h-3" />
                            <span className="text-[10px] font-black">
                                {processRule.total_order_process_late} ATRASADOS
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-600 border border-green-50">
                            <Clock className="w-3 h-3" />
                            <span className="text-[9px] font-bold uppercase">Em dia</span>
                        </div>
                    )}

                    {processRule.total_order_queue > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                            <ListChecks className="w-3 h-3" />
                            <span className="text-[10px] font-bold">
                                {processRule.total_order_queue} fila
                            </span>
                        </div>
                    )}
                </div>

                {/* Progress bar decorative line - thinner */}
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ${processRule.total_order_process_late > 0 ? 'bg-red-500' : 'bg-purple-500'}`}
                        style={{ width: processRule.total_order_queue > 0 ? '100%' : '0%' }}
                    />
                </div>
            </div>
        </Link>
    )
}

export default CardProcessRule;