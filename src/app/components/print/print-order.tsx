"use client";
import GetCompany from "@/app/api/company/company";
import GetOrderPrintByID from "@/app/api/print/print-order"
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { Session } from "next-auth";
import printService from '@/app/utils/print-service';

interface PrintOrderProps {
    orderID: string;
    session: Session;
}

const printOrder = async ({ orderID, session }: PrintOrderProps) => {
    if (typeof window === 'undefined') return;

    // Obtém o conteúdo de impressão uma única vez
    let html: string;
    try {
        const result = await GetOrderPrintByID(orderID, session) as any;
        if (result instanceof Blob) {
            html = await result.text();
        } else {
            html = String(result);
        }
    } catch (fetchError: any) {
        notifyError(`Erro ao obter conteúdo de impressão: ${fetchError?.message || "Erro desconhecido"}`);
        return;
    }

    // Tenta usar o Print Agent (WebSocket) primeiro
    try {
        const company = await GetCompany(session);
        let printerName = company.preferences["printer_order_on_pend_order"] || "default";

        if (printerName === "default") {
            const printers = await printService.getPrinters();
            if (printers.length > 0) {
                printerName = printers[0].name;
            }
        }

        await printService.print(html, printerName);
        notifySuccess(`Impressão enviada para ${printerName}`);
        return;
    } catch (wsError: any) {
        console.warn("Erro ao usar Print Agent, tentando fallback:", wsError);
        
        // Fallback: tenta Electron se ainda estiver disponível
        try {
            if (typeof window !== 'undefined' && (window as any).electronAPI?.printer) {
                const company = await GetCompany(session);
                let printerName = company.preferences["printer_order_on_pend_order"] || "default";

                if (printerName === "default") {
                    const printers = await (window as any).electronAPI.getPrinters();
                    if (printers.length > 0) {
                        printerName = printers[0].name;
                    }
                }

                await (window as any).electronAPI.printer(html, printerName, { silent: false, printBackground: true });
                notifySuccess(`Impressão enviada para ${printerName}`);
                return;
            }
        } catch (electronError: any) {
            console.warn("Erro ao usar Electron, tentando fallback do browser:", electronError);
        }

        // Fallback final: abre diálogo de impressão do browser
        try {
            const w = window.open('', '_blank', 'width=800,height=600');
            if (!w) {
                throw new Error("Não foi possível abrir janela de impressão");
            }
            w.document.write(html);
            w.document.close();
            w.focus();
            w.print();
            w.onafterprint = () => w.close();
            notifySuccess("Diálogo de impressão aberto");
        } catch (browserError: any) {
            const errorMessage = wsError?.message || 
                                (typeof wsError === 'string' ? wsError : '') ||
                                browserError?.message || 
                                "Erro desconhecido ao imprimir";
            notifyError(`Erro ao imprimir: ${errorMessage}`);
        }
    }
};

export default printOrder