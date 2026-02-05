
// Interfaces para analytics de produção
export interface OrderProcessAnalytics {
    process_rule_id: string;
    process_rule_name: string;
    total_processes: number;
    completed_processes: number;
    cancelled_processes: number;
    average_process_time: number; // em segundos
    total_process_time: number; // em segundos
    total_paused_count: number;
    efficiency_score: number;
    categories_processed: Record<string, CategoryProcessMetrics>;
    employee_performance: Record<string, EmployeeProcessMetrics>;
}

export interface QueueAnalytics {
    process_rule_id: string;
    process_rule_name: string;
    total_queues: number;
    completed_queues: number;
    average_queue_time: number; // em segundos
    total_queue_time: number; // em segundos
}

export interface CategoryProcessMetrics {
    category_id: string;
    category_name: string;
    total_processes: number;
    average_process_time: number; // em segundos
}

export interface EmployeeProcessMetrics {
    employee_id: string;
    employee_name: string;
    total_processes: number;
    completed_processes: number;
    average_process_time: number; // em segundos
    efficiency_score: number;
}