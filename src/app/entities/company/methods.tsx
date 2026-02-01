import { ptBR } from "date-fns/locale"
import { format } from "date-fns"
import { toZonedTime } from 'date-fns-tz';
import { Badge } from "@/components/ui/badge";

const TIME_ZONE = 'America/Sao_Paulo';

export function safeFormat(dateStr: string, fmt: string) {
    try {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "-";

        // Convert UTC to São Paulo timezone
        const zonedDate = toZonedTime(d, TIME_ZONE);
        return format(zonedDate, fmt, { locale: ptBR });
    } catch (e) {
        return "-";
    }
}

export function getStatusBadge(status: string) {
    if (!status) return <Badge variant="secondary" > -</Badge>;

    const s = status.toLowerCase();
    switch (s) {
        case "approved":
        case "paid":
            return <Badge className="bg-green-500" > Pago </Badge>;
        case "pending":
            return <Badge variant="outline" className="text-yellow-600 border-yellow-600" > Pendente </Badge>;
        case "refused":
        case "rejected":
            return <Badge variant="destructive" > Recusado </Badge>;
        case "cancelled":
            return <Badge variant="secondary" className="bg-gray-200 text-gray-600" > Cancelado </Badge>;
        case "payment_generated":
            return <Badge variant="outline" className="text-blue-600 border-blue-600" > Pagamento Gerado </Badge>;
        case "overdue":
            return <Badge variant="destructive" > Vencido </Badge>;
        case "waived":
            return <Badge variant="secondary" > Isento </Badge>;
        default:
            return <Badge variant="secondary" > {status} </Badge>;
    }
}