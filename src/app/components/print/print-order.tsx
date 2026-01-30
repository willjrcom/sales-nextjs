"use client";
import GetOrderPrintByID from "@/app/api/print/print-order"
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { Session } from "next-auth";
import printService from '@/app/utils/print-service';
import Company from "@/app/entities/company/company";

interface PrintOrderProps {
    orderID: string;
    session: Session;
    company: Company;
    printerKey?: string;
}

const printOrder = async ({ orderID, session, company, printerKey }: PrintOrderProps) => {

    // Obtém o conteúdo de impressão uma única vez
    let printContent: string;
    try {
        const result = await GetOrderPrintByID(orderID, session) as any;
        if (result instanceof Blob) {
            printContent = await result.text();
        } else {
            printContent = String(result);
        }
    } catch (fetchError: any) {
        notifyError(`Erro ao obter conteúdo de impressão: ${fetchError?.message || "Erro desconhecido"}`);
        return;
    }

    // Tenta usar o Print Agent (WebSocket) primeiro
    try {
        let printerName = "default";

        if (printerKey && company?.preferences[printerKey]) {
            printerName = company.preferences[printerKey];
        } else {
            printerName = company?.preferences["printer_order_on_pend_order"] || "default";
        }

        if (printerName === "default") {
            const printers = await printService.getPrinters();
            if (printers.length > 0) {
                printerName = printers[0].name;
            }
        }

        await printService.print(printContent, printerName);
        notifySuccess(`Impressão enviada para ${printerName}`);
        return;
    } catch (wsError: any) {
        console.warn("Erro ao usar Print Agent, tentando fallback:", wsError);
    }

    // Fallback final: abre diálogo de impressão do browser
    try {
        // Fetch HTML content explicitly for browser printing
        let htmlContent = printContent;
        try {
            const resultHtml = await GetOrderPrintByID(orderID, session, 'html');
            htmlContent = String(resultHtml);
        } catch (e) {
            console.warn("Failed to fetch HTML format, trying with original content", e);
        }

        const w = window.open('', '_blank', 'width=800,height=600');
        if (!w) {
            throw new Error("Não foi possível abrir janela de impressão");
        }
        w.document.write(htmlContent);
        w.document.close();
        w.focus();
        w.print();
        w.onafterprint = () => w.close();
        notifySuccess("Diálogo de impressão aberto");
    } catch (browserError: any) {
        const errorMessage = browserError?.message || "Erro desconhecido ao imprimir";
        notifyError(`Erro ao imprimir: ${errorMessage}`);
    }
};

export default printOrder