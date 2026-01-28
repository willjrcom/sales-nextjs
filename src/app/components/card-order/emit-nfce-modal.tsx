"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { emitNFCe, type FiscalInvoice } from "@/app/api/fiscal/invoices";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { useModal } from "@/app/context/modal/context";

interface EmitNFCeModalProps {
    orderId: string;
    onSuccess?: () => void;
}

const EmitNFCeModal = ({ orderId, onSuccess }: EmitNFCeModalProps) => {
    const { data: session } = useSession();
    const modalHandler = useModal();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<FiscalInvoice | null>(null);

    const handleEmit = async () => {
        if (!session) return;
        setLoading(true);
        try {
            const invoice = await emitNFCe(session, orderId);
            setResult(invoice);
            notifySuccess("NFC-e emitida com sucesso!");
            onSuccess?.();
        } catch (error: any) {
            notifyError(error?.message ?? "Erro ao emitir NFC-e.");
        } finally {
            setLoading(false);
        }
    };

    const statusColors: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-700",
        authorized: "bg-green-100 text-green-700",
        rejected: "bg-red-100 text-red-700",
        cancelled: "bg-gray-100 text-gray-700",
    };

    const statusLabels: Record<string, string> = {
        pending: "Pendente",
        authorized: "Autorizada",
        rejected: "Rejeitada",
        cancelled: "Cancelada",
    };

    if (result) {
        return (
            <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">
                        NFC-e Emitida com Sucesso!
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                        <p>
                            <strong>Número:</strong> {result.numero}
                        </p>
                        <p>
                            <strong>Série:</strong> {result.serie}
                        </p>
                        <p>
                            <strong>Status:</strong>{" "}
                            <span
                                className={`px-2 py-1 rounded text-xs ${statusColors[result.status]}`}
                            >
                                {statusLabels[result.status]}
                            </span>
                        </p>
                        {result.chave_acesso && (
                            <p className="break-all">
                                <strong>Chave de Acesso:</strong>{" "}
                                <span className="font-mono text-xs">{result.chave_acesso}</span>
                            </p>
                        )}
                        {result.protocolo && (
                            <p>
                                <strong>Protocolo:</strong> {result.protocolo}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => modalHandler.hideModal("emit-nfce-" + orderId)}
                    className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
                >
                    Fechar
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-gray-700">
                Deseja emitir uma NFC-e (Nota Fiscal de Consumidor Eletrônica) para
                este pedido?
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                💡 <strong>Custo:</strong> R$ 0,10 por nota emitida. O valor será
                adicionado ao seu billing mensal.
            </div>
            <div className="flex gap-3">
                <button
                    onClick={handleEmit}
                    disabled={loading}
                    className="flex-1 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                    {loading ? "Emitindo..." : "Confirmar Emissão"}
                </button>
                <button
                    onClick={() => modalHandler.hideModal("emit-nfce-" + orderId)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};

export default EmitNFCeModal;
