const showStatus: Record<string, string> = {
    Staging: "Em Escolha",
    Pending: "Pendente",
    Started: "Iniciado",
    Ready: "Pronto",
    Shipped: "Enviado",
    Delivered: "Entregue",
    Closed: "Fechado",
    Finished: "Finalizado",
    Canceled: "Cancelado",
    Archived: "Arquivado",
    default: "Indefinido"
} as const;

const getStatusColor: Record<string, string> = {
    "Staging": "bg-blue-100 text-blue-800",
    "Pending": "bg-yellow-100 text-yellow-800",
    "Started": "bg-green-100 text-green-800",
    "Ready": "bg-green-200 text-green-900",
    "Shipped": "bg-gray-100 text-gray-800",
    "Delivered": "bg-gray-100 text-gray-800",
    "Closed": "bg-gray-100 text-gray-800",
    "Finished": "bg-gray-100 text-gray-800",
    "Canceled": "bg-red-100 text-red-800",
    "Archived": "bg-purple-100 text-purple-800",
    default: "bg-gray-100 text-gray-800"
} as const;

export { showStatus, getStatusColor }