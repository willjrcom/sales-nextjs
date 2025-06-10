"use client";
import GetGroupItemPrintByID from "@/app/api/print/print-group-item";
import GetOrderPrintByID from "@/app/api/print/print-order"
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { Session } from "next-auth";

interface PrintGroupItemProps {
    groupItemID: string;
    printerName?: string;
    session: Session;
}

const printGroupItem = async ({ groupItemID, printerName, session }: PrintGroupItemProps) => {
    if (typeof window === 'undefined') return;

    // obtém o conteúdo de impressão (pode vir como Blob ou string)
    const result = await GetGroupItemPrintByID(groupItemID, session) as any;
    let html: string;
    if (result instanceof Blob) {
        html = await result.text();
    } else {
        html = String(result);
    }
    if (window.electronAPI?.printer) {
        printerName = printerName || "default";

        if (printerName === "default") {
            const printers = await window.electronAPI.getPrinters();
            if (printers.length > 0) {
                printerName = printers[0].name;
            }
        }

        try {
            await window.electronAPI.printer(html, printerName, { silent: false, printBackground: true });
            notifySuccess(`Impressão enviada para ${printerName}`);
        } catch (err: any) {
            notifyError(`Erro ao chamar a impressora: ${err?.message || err}`);
        }
    } else {
        const w = window.open('', '_blank', 'width=800,height=600');
        if (!w) return;
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
        w.onafterprint = () => w.close();
    }
};

export default printGroupItem