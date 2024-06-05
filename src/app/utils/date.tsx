import { parseISO, format } from 'date-fns';

const DateComponent = (dateString: string) => {
    // Função para formatar a data
    const formatDate = (dateString: string) => {
        const parsedDate = parseISO(dateString); // Convertendo a string para um objeto Date
        const formattedDate = format(parsedDate, "yyyy-MM-dd'T'HH:mm:ssXXX"); // Formatando a data no formato desejado
        return formattedDate;
    };

    return formatDate(dateString)
};

export default DateComponent;
