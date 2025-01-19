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
    if (!dateString) return "--:--:--"

    const date = new Date(dateString);
    const zonedDate = toZonedTime(date, "UTC"); // Usa UTC para evitar problemas de fuso horário

    // Formata a data corretamente
    const formattedDate = formatUTC(zonedDate, "HH:mm:ss", { timeZone: "UTC" });

    return formattedDate;
}

const ToUtcHoursMinutes = (dateString?: string) => {
    if (!dateString) return "--:--"

    const date = new Date(dateString);
    const zonedDate = toZonedTime(date, "UTC"); // Usa UTC para evitar problemas de fuso horário

    // Formata a data corretamente
    const formattedDate = formatUTC(zonedDate, "HH:mm", { timeZone: "UTC" });

    return formattedDate;
}

const ToUtcMinutesSeconds = (dateString?: string) => {
    if (!dateString) return "--:--"

    const date = new Date(dateString);
    const zonedDate = toZonedTime(date, "UTC"); // Usa UTC para evitar problemas de fuso horário

    // Formata a data corretamente
    const formattedDate = formatUTC(zonedDate, "mm:ss", { timeZone: "UTC" });

    return formattedDate;
}

function ConvertDurationToDate(durationNanoseconds: string | Number): Date {
    const durationMilliseconds = Number(durationNanoseconds) / 1e6; // Converte nanosegundos para milissegundos
    const baseDate = new Date(0); // Base "zero" (1970-01-01T00:00:00.000Z)
    return new Date(baseDate.getTime() + durationMilliseconds); // Soma os milissegundos ao tempo base
}



export { ToIsoDate, ToUtcDate, ToUtcDatetime, ToUtcTimeWithSeconds, ToUtcHoursMinutes, ToUtcMinutesSeconds, ConvertDurationToDate };
