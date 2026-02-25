"use client";

import GetGroupItemPrintByID from "@/app/api/print-manager/print-group-item";
import { notifySuccess, notifyError } from '@/app/utils/notifications';
import { Session } from "next-auth";
import RequestError from "@/app/utils/error";
import RequestGroupItemPrintByID from "../../api/print-manager/request-print-group-item";

interface PrintGroupItemProps {
    groupItemID: string;
    session: Session;
}

const printGroupItem = async ({ groupItemID, session }: PrintGroupItemProps) => {
    try {
        await RequestGroupItemPrintByID(groupItemID, session);
        notifySuccess("Impressão enviada para o Print Agent");
        return;
    } catch (error) {
        const err = error as RequestError;
        notifyError(err.message || "Erro ao obter conteúdo de impressão");
    }

    // Fallback final: abre diálogo de impressão do browser
    try {
        const resultHtml = await GetGroupItemPrintByID(groupItemID, session, 'html');
        const htmlContent = String(resultHtml);

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
    } catch (e) {
        console.warn("Failed to fetch HTML format, trying with original content", e);
    }
};

export default printGroupItem