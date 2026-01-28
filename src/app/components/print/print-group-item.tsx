"use client";
import GetGroupItemPrintByID from "@/app/api/print/print-group-item";
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { Session } from "next-auth";
import printService from '@/app/utils/print-service';

interface PrintGroupItemProps {
    groupItemID: string;
    printerName?: string;
    session: Session;
}

const printGroupItem = async ({ groupItemID, printerName, session }: PrintGroupItemProps) => {

    // Obtém o conteúdo de impressão uma única vez
    let printContent: string;
    try {
        const result = await GetGroupItemPrintByID(groupItemID, session) as any;
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
        let selectedPrinter = printerName || "default";

        if (selectedPrinter === "default") {
            const printers = await printService.getPrinters();
            if (printers.length > 0) {
                selectedPrinter = printers[0].name;
            }
        }

        await printService.print(printContent, selectedPrinter);
        notifySuccess(`Impressão enviada para ${selectedPrinter}`);
        return;
    } catch (wsError: any) {
        console.warn("Erro ao usar Print Agent, tentando fallback:", wsError);
    }

    // Fallback final: abre diálogo de impressão do browser
    try {
        // Fetch HTML content explicitly for browser printing
        let htmlContent = printContent;
        try {
            // If the initial fetch wasn't HTML (checked by looking for <html> tag or similar, or just re-fetch to be safe/consistent)
            // or simply purely re-fetch requesting HTML format.
            const resultHtml = await GetGroupItemPrintByID(groupItemID, session, 'html');
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

export default printGroupItem