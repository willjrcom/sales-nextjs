"use client";
import GerOrderPrintByID from "@/app/api/print/print-order"
import { Session } from "next-auth";

interface PrintOrderProps {
    orderID: string;
    session: Session;
}

const printOrder = async ({ orderID, session }: PrintOrderProps) => {
    if (typeof window === 'undefined') return;

    const html = await GerOrderPrintByID(orderID, session);
    
    if (window.electronAPI?.printer) {
        await window.electronAPI.printer(html, { silent: false, printBackground: true });
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