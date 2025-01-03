import { parseISO, format } from 'date-fns';
import { toZonedTime, format as formatUTC } from 'date-fns-tz';

const ToIsoDate = (dateString: string) => {
    // Função para formatar a data
    const formatDate = (dateString: string) => {
        if (!dateString) return ""
        const parsedDate = parseISO(dateString); // Convertendo a string para um objeto Date
        const formattedDate = format(parsedDate, "yyyy-MM-dd'T'HH:mm:ssXXX"); // Formatando a data no formato desejado
        return formattedDate;
    };

    return formatDate(dateString)
};

const ToUtcDate = (dateString?: string) => {
    if (!dateString) return "--/--/--"

    const date = new Date(dateString);
    const zonedDate = toZonedTime(date, "UTC"); // Usa UTC para evitar problemas de fuso horário

    // Formata a data corretamente
    const formattedDate = formatUTC(zonedDate, "dd/MM/yyyy", { timeZone: "UTC" });

    return formattedDate;
}

const ToUtcDatetime = (dateString?: string) => {
    if (!dateString) return "--/--/-- --:--"

    const date = new Date(dateString);
    const zonedDate = toZonedTime(date, "UTC"); // Usa UTC para evitar problemas de fuso horário

    // Formata a data corretamente
    const formattedDate = formatUTC(zonedDate, "dd/MM/yyyy HH:mm", { timeZone: "UTC" });

    return formattedDate;
}

const ToUtcTimeWithSeconds = (dateString?: string) => {
    if (!dateString) return "--/--/-- --:--"

    const date = new Date(dateString);
    const zonedDate = toZonedTime(date, "UTC"); // Usa UTC para evitar problemas de fuso horário

    // Formata a data corretamente
    const formattedDate = formatUTC(zonedDate, "HH:mm:ss", { timeZone: "UTC" });

    return formattedDate;
}

export { ToIsoDate, ToUtcDate, ToUtcDatetime, ToUtcTimeWithSeconds };
