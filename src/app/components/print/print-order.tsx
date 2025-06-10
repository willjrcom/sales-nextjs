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
    if (window.electronAPI?.getPrinters && window.electronAPI?.printer) {
        const printers = await window.electronAPI.getPrinters();
        let printerName: string | undefined;
        if (printers.length === 0) {
            console.warn('Nenhuma impressora disponível. Usando padrão.');
        } else if (printers.length === 1) {
            printerName = printers[0].name;
        } else {
            const list = printers.map((p, i) => `${i + 1}: ${p.name}`).join('\n');
            const choice = window.prompt(`Selecione a impressora:\n${list}`, '1');
            const idx = parseInt(choice || '1', 10) - 1;
            if (printers[idx]) {
                printerName = printers[idx].name;
            }
        }
        await window.electronAPI.printer(html, printerName, { silent: false, printBackground: true });
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