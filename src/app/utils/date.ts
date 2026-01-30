import { parseISO, format, parse, addHours } from 'date-fns';
import { toZonedTime, format as formatUTC } from 'date-fns-tz';
// Time zone for São Paulo, Brasil
const TIME_ZONE = 'America/Sao_Paulo';

const ToIsoDate = (dateString: string) => {
    // Função para formatar a data
    const formatDate = (dateString: string) => {
        if (!dateString) return ""

        let parsedDate;
        // Check if date matches DD/MM/YYYY format
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
            parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
        } else {
            parsedDate = parseISO(dateString); // Convertendo a string para um objeto Date
        }

        const formattedDate = format(parsedDate, "yyyy-MM-dd'T'HH:mm:ssXXX"); // Formatando a data no formato desejado
        return formattedDate;
    };

    return formatDate(dateString)
};

const ToUtcDate = (dateString?: string) => {
    if (!dateString) return "--/--/--"

    // If date is already formatted as DD/MM/YYYY, return it as is
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return dateString;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return dateString // Return raw value if invalid date to prevent crash
    }

    // Add buffer to prevent LMT timezone shifts (e.g. year 1213) from moving date to previous day
    const safeDate = addHours(date, 12);
    const zonedDate = toZonedTime(safeDate, TIME_ZONE); // Ajusta para fuso de São Paulo

    // Formata a data corretamente
    const formattedDate = formatUTC(zonedDate, "dd/MM/yyyy", { timeZone: TIME_ZONE });

    return formattedDate;
}

const ToUtcDatetime = (dateString?: string) => {
    if (!dateString) return "--/--/-- --:--"

    const date = new Date(dateString);
    const zonedDate = toZonedTime(date, TIME_ZONE); // Ajusta para fuso de São Paulo

    // Formata a data corretamente
    const formattedDate = formatUTC(zonedDate, "dd/MM/yyyy HH:mm", { timeZone: TIME_ZONE });

    return formattedDate;
}

const ToUtcTimeWithSeconds = (dateString?: string) => {
    if (!dateString) return "--:--:--"

    const date = new Date(dateString);
    const zonedDate = toZonedTime(date, TIME_ZONE); // Ajusta para fuso de São Paulo

    // Formata a data corretamente
    const formattedDate = formatUTC(zonedDate, "HH:mm:ss", { timeZone: TIME_ZONE });

    return formattedDate;
}

const ToUtcHoursMinutes = (dateString?: string) => {
    if (!dateString) return "--:--"

    const date = new Date(dateString);
    const zonedDate = toZonedTime(date, TIME_ZONE); // Ajusta para fuso de São Paulo

    // Formata a data corretamente
    const formattedDate = formatUTC(zonedDate, "HH:mm", { timeZone: TIME_ZONE });

    return formattedDate;
}

const ToUtcMinutesSeconds = (dateString?: string) => {
    if (!dateString) return "--:--"

    const date = new Date(dateString);
    const zonedDate = toZonedTime(date, TIME_ZONE); // Ajusta para fuso de São Paulo

    // Formata a data corretamente
    const formattedDate = formatUTC(zonedDate, "mm:ss", { timeZone: TIME_ZONE });

    return formattedDate;
}

function ConvertDurationToDate(durationNanoseconds: string | Number): Date {
    const durationMilliseconds = Number(durationNanoseconds) / 1e6; // Converte nanosegundos para milissegundos
    const baseDate = new Date(0); // Base "zero" (1970-01-01T00:00:00.000Z)
    return new Date(baseDate.getTime() + durationMilliseconds); // Soma os milissegundos ao tempo base
}



export { ToIsoDate, ToUtcDate, ToUtcDatetime, ToUtcTimeWithSeconds, ToUtcHoursMinutes, ToUtcMinutesSeconds, ConvertDurationToDate };
