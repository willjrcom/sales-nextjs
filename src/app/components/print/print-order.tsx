"use client";
import GerOrderPrintByID from "@/app/api/print/print-order"
import { Session } from "next-auth";

interface PrintOrderProps {
    orderID: string;
    session: Session;
}

const printOrder = async ({ orderID, session }: PrintOrderProps) => {
    if (typeof window === 'undefined') return;

    // obtém o conteúdo de impressão (pode vir como Blob ou string)
    const result = await GerOrderPrintByID(orderID, session) as any;
    let html: string;
    if (result instanceof Blob) {
        html = await result.text();
    } else {
        html = String(result);
    }
    if (window.electronAPI?.printer) {
        let printerName = session.user.current_company?.preferences["print_order"] || "default";

        if (printerName === "default") {
            const printers = await window.electronAPI.getPrinters();
            if (printers.length > 0) {
                printerName = printers[0].name;
            }
        }

        await window.electronAPI.printer(html, printerName, { silent: true, printBackground: true });
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

export default printOrder