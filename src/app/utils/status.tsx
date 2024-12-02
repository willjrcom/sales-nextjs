const convertStatus: Record<string, string> = {
    Staging: "Em andamento",
    Pending: "Pendente",
    Started: "Iniciado",
    Ready: "Pronto",
    Finished: "Finalizado",
    Canceled: "Cancelado",
    Archived: "Arquivado",
};

const showStatus = (status: string) => convertStatus[status] || "Desconhecido";
export { showStatus }