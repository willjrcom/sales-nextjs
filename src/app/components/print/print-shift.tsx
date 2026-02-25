"use client";
import GetShiftPrintByID from "@/app/api/print/print-shift";
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { Session } from "next-auth";
import printService from '@/app/utils/print-service';
import RequestError from "@/app/utils/error";
import Company from "@/app/entities/company/company";

interface PrintShiftProps {
    shiftID: string;
    session: Session;
    company?: Company;
    printerName?: string;
}

const printShift = async ({ shiftID, session, company, printerName }: PrintShiftProps) => {
    let printContent: string;
    try {
        printContent = await GetShiftPrintByID(shiftID, session);
    } catch (error) {
        const err = error as RequestError;
        notifyError(err.message || "Erro ao obter conteúdo de impressão");
        return;
    }

    try {
        let finalPrinter = printerName || company?.preferences["printer_shift_report"] || "default";

        if (finalPrinter === "default") {
            const printers = await printService.getPrinters();
            if (printers.length > 0) {
                finalPrinter = printers[0].name;
            }
        }

        await printService.print(printContent, finalPrinter);
        notifySuccess(`Impressão do turno enviada para ${finalPrinter}`);
    } catch (wsError: any) {
        console.warn("Erro ao usar Print Agent:", wsError);
        notifyError(`Erro ao imprimir: ${wsError.message || "Serviço de impressão não disponível"}`);
    }
};

export default printShift;
